input_ass=segment_3.original.ass
output_ass=segment_3.ass
# youshael, pod_p, karaoke, clean_bold, neon_punch, retro_typewriter, elegant_serif, big_blocky_comic, beasty, deep_diver, mozi
ass_style=youshael
input_video=segment_3.mp4
output_video=segment_3_with_subtitles.mp4

#poetry run python apply_style_on_ass_file.py apply-style-on-ass-file  \
#  --ass-file $input_ass  \
#  --output-file $output_ass \
#  --style-name $ass_style



ffmpeg -i $input_video -y -vf "subtitles=$output_ass:force_style='Alignment=10,FontSize=12'" \
-c:v libx264 -c:a copy \
-preset ultrafast \
-crf 30 \
-threads 2 \
$output_video
