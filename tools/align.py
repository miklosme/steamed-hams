"""Forced alignment of the corrected transcript against the isolated voice stem.

timeline/script.src.json  ->  timeline/script.json

Words are aligned with torchaudio's MMS forced aligner (CTC, 20 ms frames) line by
line, each inside its own time window, with a wildcard token at both ends to
soak up neighbouring lines, breaths and music. Each word is then split into phonemes
(CMUdict) and mapped to a small mouth-shape set. Times are seconds on the
source clock; frames are video frames at 24000/1001 fps.
"""
import json
import re
import wave
from pathlib import Path

import cmudict
import numpy as np
import torch
import torchaudio

ROOT = Path(__file__).resolve().parent.parent
FPS = 24000 / 1001
N_FRAMES = 4047
SR = 16000

EXTRA = {  # words CMUdict lacks, or where its first entry is the wrong reading
    "egads": "IY G AE D Z", "krusty": "K R AH S T IY", "isometric": "AY S AH M EH T R IH K",
    "mouthwatering": "M AW TH W AO T ER IH NG", "windowsill": "W IH N D OW S IH L",
    "ho": "HH OW", "uh": "AH", "eh": "EH", "mmm": "M", "ye": "Y EH", "ooh": "UW", "ah": "AA",
    "huh": "HH AH", "utica": "Y UW T IH K AH", "borealis": "B AO R IY AE L IH S",
    "there'll": "DH EH R AH L", "superintendent's": "S UW P ER IH N T EH N D AH N T S",
    "skinner's": "S K IH N ER Z", "gonna": "G AH N AH", "pooped": "P UW P T",
}
VISEME = {}
for v, ps in {
    "MBP": "M B P", "FV": "F V", "L": "L TH DH", "AI": "AA AE AH AY AW",
    "E": "EH EY IH IY ER", "O": "AO OW OY", "U": "UW UH W",
    "C": "S Z T D N K G CH JH SH ZH Y HH R NG",
}.items():
    for p in ps.split():
        VISEME[p] = v
VOWELS = set("AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW".split())


def read_wav(path):
    with wave.open(str(path)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def norm_words(text):
    text = text.lower().replace("’", "'")
    return re.findall(r"[a-z']+", text)


def frame_of(t):
    return int(t * FPS + 1e-6)


def main():
    src = json.loads((ROOT / "timeline" / "script.src.json").read_text())["lines"]
    wav = read_wav(ROOT / ".cache" / "vocals16k.wav")
    cmu = cmudict.dict()

    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model(with_star=True).to("cuda").eval()
    labels = bundle.get_labels(star="*")
    tok = {c: i for i, c in enumerate(labels)}
    with torch.inference_mode(), torch.autocast("cuda", dtype=torch.float16):
        em, _ = model(torch.from_numpy(wav)[None].to("cuda"))
    em = torch.log_softmax(em.float(), -1)
    sec_per_step = len(wav) / SR / em.shape[1]

    # each line is aligned inside its own window: * word word ... *
    # (the wildcard soaks up the neighbouring line, breaths and music)
    PAD = 0.15
    word_span = {}
    for li, line in enumerate(src):
        if line.get("kind") in ("sound", "sung"):
            continue
        s0 = max(0, int((line["near"][0] - PAD) / sec_per_step))
        s1 = min(em.shape[1], int((line["near"][1] + PAD) / sec_per_step) + 1)
        tokens, owners = [tok["*"]], [None]
        for wi, w in enumerate(norm_words(line["text"])):
            tokens += [tok[c] for c in w]
            owners += [(li, wi)] * len(w)
        tokens.append(tok["*"])
        owners.append(None)
        target = torch.tensor([tokens], dtype=torch.int32, device="cuda")
        path, scores = torchaudio.functional.forced_align(em[:, s0:s1], target, blank=0)
        spans = torchaudio.functional.merge_tokens(path[0], scores[0].exp())
        assert len(spans) == len(tokens)
        for sp, own in zip(spans, owners):
            if own is None:
                continue
            a = word_span.setdefault(own, [s0 + sp.start, s0 + sp.end, [], 0])
            a[1] = s0 + sp.end
            a[2].append(sp.score * (sp.end - sp.start))
            a[3] += sp.end - sp.start

    # voice envelope per video frame (dB RMS of the voice stem), for sounds and as a fallback
    hop = SR / FPS
    rms = np.array([
        np.sqrt(np.mean(wav[int(i * hop):int((i + 1) * hop)] ** 2) + 1e-12) for i in range(N_FRAMES)
    ])
    db = 20 * np.log10(rms + 1e-9)
    env = np.clip((db + 50) / 35, 0, 1)

    # finer envelope (10 ms) to time non-word sounds and to tidy word edges
    h = SR // 100
    fine = 20 * np.log10(np.sqrt(np.mean(wav[:len(wav) // h * h].reshape(-1, h) ** 2, axis=1) + 1e-12) + 1e-9)
    voiced = fine > -42

    def voiced_onset(t, floor):
        """Walk back from t to where the voice actually starts, no earlier than floor."""
        i = int(t * 100)
        while i > 0 and voiced[i - 1] and (i - 1) / 100 >= floor:
            i -= 1
        return i / 100

    def voiced_end(t, ceil):
        i = int(t * 100)
        while i < len(voiced) and voiced[i] and i / 100 < ceil:
            i += 1
        return i / 100

    out, prev_end = [], 0.0
    for li, line in enumerate(src):
        rec = {"id": f"L{li + 1:02d}", "who": line["who"], "kind": line.get("kind", "speech"), "text": line["text"]}
        lo, hi = line["near"]
        next_lo = src[li + 1]["near"][0] if li + 1 < len(src) else 1e9
        if rec["kind"] == "sung":
            rec.update(t0=lo, t1=hi, approx=True)
        elif rec["kind"] == "sound":
            i0, i1 = int(lo * 100), int(hi * 100)
            seg = fine[i0:i1]
            on = np.where(seg > max(seg.max() - 22, -45))[0]
            t0, t1 = (i0 + on[0]) / 100, (i0 + on[-1] + 1) / 100
            # bursts inside the sound (each "ho" of a chuckle): rising edges of the loud part
            loud = seg > seg.max() - 10
            pulses = [(i0 + k) / 100 for k in range(len(loud)) if loud[k] and (k == 0 or not loud[k - 1])]
            pulses = [p for k, p in enumerate(pulses) if k == 0 or p - pulses[k - 1] > 0.08]
            rec.update(t0=round(t0, 3), t1=round(t1, 3), pulses=[round(p, 2) for p in pulses])
        else:
            raw = [(w, *word_span[(li, wi)]) for wi, w in enumerate(norm_words(line["text"]))]
            words = []
            for k, (w, s, e, sc, n) in enumerate(raw):
                t0, t1 = s * sec_per_step, e * sec_per_step
                if k == 0:
                    # CTC fires late on soft onsets: open the mouth where the voice starts
                    t0 = max(voiced_onset(t0, max(prev_end, t0 - 0.4, lo - PAD)), 0.0)
                # CTC spans only cover the emitting frames: stretch each word to the next
                # one, or to the end of the voiced run if a pause follows
                nxt = raw[k + 1][1] * sec_per_step if k + 1 < len(raw) else None
                if nxt is not None and nxt - t1 < 0.2:
                    t1 = nxt
                else:
                    t1 = max(t1, voiced_end(t1, min(nxt if nxt is not None else min(hi + PAD, next_lo + 0.06), t1 + 0.6)))
                phones = (EXTRA.get(w) or " ".join(re.sub(r"\d", "", p) for p in cmu[w][0])).split() \
                    if (w in EXTRA or w in cmu) else []
                wts = np.array([1.6 if p in VOWELS else 1.0 for p in phones]) if phones else np.array([])
                cuts = t0 + (t1 - t0) * np.concatenate([[0], np.cumsum(wts) / wts.sum()]) if phones else []
                words.append({
                    "w": w, "t0": round(t0, 3), "t1": round(t1, 3), "score": round(float(sum(sc) / max(n, 1)), 2),
                    "phones": [
                        {"p": p, "v": VISEME[p], "t0": round(float(cuts[j]), 3), "t1": round(float(cuts[j + 1]), 3)}
                        for j, p in enumerate(phones)
                    ],
                })
                if not phones:
                    print("no pronunciation:", w)
            rec.update(t0=words[0]["t0"], t1=words[-1]["t1"], words=words)
            prev_end = rec["t1"]
        rec.update(f0=frame_of(rec["t0"]), f1=frame_of(rec["t1"]))
        if rec["t0"] < lo - 0.3 or rec["t1"] > hi + 0.3:
            print(f"CHECK {rec['id']} {rec['who']}: aligned {rec['t0']:.2f}-{rec['t1']:.2f}, window {lo}-{hi}: {line['text'][:40]}")
        out.append(rec)

    for a, b in zip(out, out[1:]):  # a sound running into the same speaker's next line ends there
        if b["t0"] < a["t1"]:
            a["t1"] = b["t0"]
            a["f1"] = frame_of(a["t1"])

    (ROOT / "timeline" / "script.json").write_text(json.dumps({
        "fps": "24000/1001",
        "sync": {
            "times": "audio-true: when each sound is heard in the source clip",
            "reference_picture_lead_frames": 3.5,
            "note": "In the source clip the drawn mouths run about 3 to 4 frames ahead of the voice (measured by "
                    "correlating drawn mouth openness with the voice; host 4, guest 3). Subtract this from a frame "
                    "number here to get the frame where the source picture shows that mouth shape.",
        },
        "visemes": {"X": "rest / closed", "MBP": "lips pressed", "FV": "lower lip under teeth", "L": "tongue up",
                    "AI": "wide open", "E": "half open, wide", "O": "round open", "U": "small round",
                    "C": "teeth together, slightly open"},
        "lines": out,
        "voice_envelope": {"note": "per video frame, 0..1, from the isolated voice stem (-50..-15 dBFS)",
                           "values": [round(float(v), 2) for v in env]},
    }, indent=1))
    print(len(out), "lines;", sum(len(l.get("words", [])) for l in out), "words")


if __name__ == "__main__":
    main()
