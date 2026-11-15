#!/bin/sh
# Browser-friendly copy of the reference clip for the overlay: H.264, every 6th
# frame a keyframe so scrubbing lands on exact frames; the audio is copied untouched.
set -e
cd "$(dirname "$0")/.."
mkdir -p media
ffmpeg -v error -y -i "data/Steamed Hams [4jXEuIHY9ic].mp4" \
  -vf scale=960:540 -c:v libx264 -preset medium -crf 20 -g 6 -bf 0 -pix_fmt yuv420p \
  -fps_mode passthrough -c:a copy -movflags +faststart media/ref.mp4
ffprobe -v error -select_streams v -show_entries stream=nb_frames,avg_frame_rate -of csv=p=0 media/ref.mp4
