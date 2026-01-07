ffmpeg -i  ~/Downloads/subtiter_demo_3x.mp4 -filter_complex \
  "[0:v]trim=start=0:end=4,setpts=PTS-STARTPTS[v1]; \
   [0:v]trim=start=44,setpts=PTS-STARTPTS[v2]; \
    [0:a]atrim=start=0:end=4,asetpts=PTS-STARTPTS[a1]; \
     [0:a]atrim=start=44,asetpts=PTS-STARTPTS[a2]; \
      [v1][a1][v2][a2]concat=n=2:v=1:a=1[outv][outa]" \
      -map "[outv]" -map "[outa]" -c:v libx264 -preset fast -crf 23 -c:a aac  ~/Downloads/subtiter_demo_3x_removed_4-44.mp4

