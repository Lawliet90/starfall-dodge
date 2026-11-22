#!/usr/bin/env bash
# Builds the entry video for post-x-the-agent-builds-a-game-from-20261122-1709.
# 9:16, 1080x1920, 30 fps, H.264, silent. Scenes:
#   A hook (3.5s) -> B the prompt (6.5s) -> C agent working (10s)
#   -> D real gameplay (24s, frames recorded in headless Chromium)
#   -> E frozen frame (2.5s) -> end card laid over the last 2.5s
#     with referral code xh1mf2kk (press-kit recipe, HOLD=0).
set -euo pipefail
cd "$(dirname "$0")"
W=1080; H=1920
SANS=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
MONO=../assets/JetBrainsMono-Bold.ttf
CARD=../assets/card-9x16-transparent.webm
CODE=xh1mf2kk

mkdir -p text scenes
# --- text files (drawtext textfile= avoids filter escaping pain) ---
printf '%s' 'I gave my AI agent' > text/a1.txt
printf '%s' 'ONE PROMPT.' > text/a2.txt
printf '%s' 'It built a game.' > text/a3.txt
printf '%s' 'I just watched.' > text/a4.txt
printf '%s' 'THE PROMPT' > text/b0.txt
printf '%s' 'Build a tiny browser game:' > text/b1.txt
printf '%s' 'fly a little rocket through' > text/b2.txt
printf '%s' 'an asteroid field - dodge' > text/b3.txt
printf '%s' 'the rocks, collect the stars,' > text/b4.txt
printf '%s' '3 lives, score climbs the' > text/b5.txt
printf '%s' 'longer you survive. Keyboard' > text/b6.txt
printf '%s' 'and touch. Make it look neon.' > text/b7.txt
printf '%s' 'one prompt. that is all.' > text/b8.txt
printf '%s' '$ agent: building starfall-dodge...' > text/c1.txt
printf '%s' '  > rocket, asteroids, stars' > text/c2.txt
printf '%s' '  > 3 lives, score, neon glow' > text/c3.txt
printf '%s' '  function spawnAsteroid() {' > text/c4.txt
printf '%s' '    const r = rand(16, 44);' > text/c5.txt
printf '%s' '    vy: rand(120, 210) + elapsed * 2.2' > text/c6.txt
printf '%s' '  }' > text/c7.txt
printf '%s' '  autopilot: ON  (for the trailer)' > text/c8.txt
printf '%s' '[ok] 412 lines, 0 errors' > text/c9.txt
printf '%s' '[ok] game ready - let us fly' > text/c10.txt
printf '%s' 'IT WORKS.' > text/d1.txt
printf '%s' 'Your turn - build on make.fun' > text/d2.txt

# --- scene A: hook, 3.5s ---
ffmpeg -y -v error -f lavfi -i "color=c=0x0b0620:s=${W}x${H}:d=3.5:r=30" -vf "\
drawtext=fontfile=$SANS:textfile=text/a1.txt:fontsize=58:fontcolor=white:x=(w-text_w)/2:y=780,\
drawtext=fontfile=$SANS:textfile=text/a2.txt:fontsize=118:fontcolor=0xff2e88:x=(w-text_w)/2:y=880,\
drawtext=fontfile=$SANS:textfile=text/a3.txt:fontsize=58:fontcolor=white:x=(w-text_w)/2:y=1080,\
drawtext=fontfile=$SANS:textfile=text/a4.txt:fontsize=58:fontcolor=0x9fdcff:x=(w-text_w)/2:y=1170" \
-c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset veryfast scenes/a.mp4

# --- scene B: the prompt, 6.5s, lines appear one by one ---
ffmpeg -y -v error -f lavfi -i "color=c=0x0b0620:s=${W}x${H}:d=6.5:r=30" -vf "\
drawbox=x=60:y=480:w=960:h=620:color=0x1a1033:t=fill,\
drawbox=x=60:y=480:w=960:h=620:color=0xff2e88:t=4,\
drawtext=fontfile=$MONO:textfile=text/b0.txt:fontsize=40:fontcolor=0xffd166:x=100:y=520,\
drawtext=fontfile=$MONO:textfile=text/b1.txt:fontsize=40:fontcolor=white:x=100:y=600:enable='gte(t,0.5)',\
drawtext=fontfile=$MONO:textfile=text/b2.txt:fontsize=40:fontcolor=white:x=100:y=658:enable='gte(t,1.1)',\
drawtext=fontfile=$MONO:textfile=text/b3.txt:fontsize=40:fontcolor=white:x=100:y=716:enable='gte(t,1.7)',\
drawtext=fontfile=$MONO:textfile=text/b4.txt:fontsize=40:fontcolor=white:x=100:y=774:enable='gte(t,2.3)',\
drawtext=fontfile=$MONO:textfile=text/b5.txt:fontsize=40:fontcolor=white:x=100:y=832:enable='gte(t,2.9)',\
drawtext=fontfile=$MONO:textfile=text/b6.txt:fontsize=40:fontcolor=white:x=100:y=890:enable='gte(t,3.5)',\
drawtext=fontfile=$MONO:textfile=text/b7.txt:fontsize=40:fontcolor=white:x=100:y=948:enable='gte(t,4.1)',\
drawtext=fontfile=$MONO:textfile=text/b8.txt:fontsize=38:fontcolor=0x9fdcff:x=(w-text_w)/2:y=1180:enable='gte(t,5.2)'" \
-c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset veryfast scenes/b.mp4

# --- scene C: agent working, 10s, code lines appear ---
ffmpeg -y -v error -f lavfi -i "color=c=0x070a12:s=${W}x${H}:d=10:r=30" -vf "\
drawtext=fontfile=$MONO:textfile=text/c1.txt:fontsize=34:fontcolor=0x7dffa8:x=60:y=420:enable='gte(t,0.3)',\
drawtext=fontfile=$MONO:textfile=text/c2.txt:fontsize=34:fontcolor=0xcfe6ff:x=60:y=490:enable='gte(t,1.2)',\
drawtext=fontfile=$MONO:textfile=text/c3.txt:fontsize=34:fontcolor=0xcfe6ff:x=60:y=550:enable='gte(t,2.0)',\
drawtext=fontfile=$MONO:textfile=text/c4.txt:fontsize=34:fontcolor=white:x=60:y=650:enable='gte(t,3.0)',\
drawtext=fontfile=$MONO:textfile=text/c5.txt:fontsize=34:fontcolor=white:x=60:y=710:enable='gte(t,3.9)',\
drawtext=fontfile=$MONO:textfile=text/c6.txt:fontsize=34:fontcolor=white:x=60:y=770:enable='gte(t,4.8)',\
drawtext=fontfile=$MONO:textfile=text/c7.txt:fontsize=34:fontcolor=white:x=60:y=830:enable='gte(t,5.7)',\
drawtext=fontfile=$MONO:textfile=text/c8.txt:fontsize=34:fontcolor=0xffd166:x=60:y=930:enable='gte(t,6.6)',\
drawtext=fontfile=$MONO:textfile=text/c9.txt:fontsize=34:fontcolor=0x7dffa8:x=60:y=1030:enable='gte(t,7.6)',\
drawtext=fontfile=$MONO:textfile=text/c10.txt:fontsize=34:fontcolor=0x7dffa8:x=60:y=1090:enable='gte(t,8.5)'" \
-c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset veryfast scenes/c.mp4

# --- scene D: real gameplay, 24s at 15 fps -> 30 fps, outro line at the end ---
ffmpeg -y -v error -framerate 15 -i frames/frame-%04d.jpg -vf "\
scale=1080:1920,fps=30,\
drawtext=fontfile=$SANS:textfile=text/d1.txt:fontsize=96:fontcolor=white:x=(w-text_w)/2:y=820:enable='between(t,21.5,24)':box=1:boxcolor=0x070312CC:boxborderw=24,\
drawtext=fontfile=$SANS:textfile=text/d2.txt:fontsize=44:fontcolor=0xffd166:x=(w-text_w)/2:y=950:enable='between(t,21.5,24)':box=1:boxcolor=0x070312CC:boxborderw=18" \
-c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset veryfast scenes/d.mp4

# --- scene E: frozen last frame, 2.5s (the end card goes over this) ---
ffmpeg -y -v error -loop 1 -i frames/frame-0359.jpg -t 2.5 -vf "scale=1080:1920,fps=30" \
-c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset veryfast scenes/e.mp4

# --- concat ---
printf "file 'scenes/a.mp4'\nfile 'scenes/b.mp4'\nfile 'scenes/c.mp4'\nfile 'scenes/d.mp4'\nfile 'scenes/e.mp4'\n" > concat.txt
ffmpeg -y -v error -f concat -safe 0 -i concat.txt -c copy clip.mp4

# --- end card: press-kit recipe, HOLD=0, code xh1mf2kk ---
LEN=2.5; REST=1.433; CX=210; CY=1232; CW=5; CH=78; MID=1271; SIZE=62
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 clip.mp4)
T=$(awk "BEGIN{print $D-$LEN}")
ffmpeg -y -v error -i clip.mp4 -c:v libvpx-vp9 -i "$CARD" -filter_complex "\
[0:v]scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=0,format=yuva420p,split[clip][soft];\
[soft]gblur=sigma=28,eq=saturation=0.35,fade=t=in:st=$T:d=0.8:alpha=1[soft];\
[clip][soft]overlay[bg];\
[1:v]format=yuva420p,setpts=PTS-STARTPTS+$T/TB[card];\
[bg][card]overlay=eof_action=pass,\
drawbox=x=$CX-2:y=$CY-2:w=$CW+4:h=$CH+4:color=white:t=fill:enable='gte(t,$T+$REST)',\
drawtext=fontfile=$MONO:text=$CODE:fontsize=$SIZE:fontcolor=0x191419:x=$CX:y=$MID-(ascent-descent)/2:enable='gte(t,$T+$REST)'[v]" \
-map '[v]' -c:v libx264 -pix_fmt yuv420p -crf 18 -preset veryfast -movflags +faststart ../video.mp4

echo "clip duration: $D s (card starts at $T s)"
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of default=noprint_wrappers=1 ../video.mp4
