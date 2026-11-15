#!/bin/sh
# Browser-friendly copy of the reference clip for the overlay: H.264, every 6th
# frame a keyframe so scrubbing lands on exact frames. The soundtrack goes to media/audio.m4a
# as AAC, which every browser plays; the player uses it as its clock.
set -e
cd "$(dirname "$0")/.."
mkdir -p media
ffmpeg -v error -y -i "data/Steamed Hams [4jXEuIHY9ic].mp4" \
  -vf scale=960:540 -c:v libx264 -preset medium -crf 20 -g 6 -bf 0 -pix_fmt yuv420p \
  -fps_mode passthrough -c:a copy -movflags +faststart media/ref.mp4
ffmpeg -v error -y -i "data/Steamed Hams [4jXEuIHY9ic].mp4" -vn -c:a aac -b:a 192k -movflags +faststart media/audio.m4a
ffprobe -v error -select_streams v -show_entries stream=nb_frames,avg_frame_rate -of csv=p=0 media/ref.mp4
