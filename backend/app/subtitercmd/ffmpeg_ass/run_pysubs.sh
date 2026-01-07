input_ass=segment_3.original.ass
ass_style=karaoke
animation=karaoke_popup_rectangle
input_video=segment_3.mp4

# Define clear output filenames
output_ass="segment_3_${animation}.ass"
output_video="segment_3_${animation}.mp4"

echo "Generating subtitle file: ${output_ass}"
poetry run python apply_subs_on_ass_file.py apply-subs-on-ass-file  \
  --ass-file $input_ass  \
  --output-file $output_ass \
  --style-name $ass_style \
  --animation $animation

echo "Burning subtitles into video: ${output_video}"
ffmpeg -i $input_video -y -vf "subtitles=${output_ass}" \
-c:v libx264 -c:a copy \
-preset ultrafast \
-crf 30 \
-threads 2 \
$output_video

echo "Generated video: ${output_video}"
echo "Generated subtitles: ${output_ass}"
