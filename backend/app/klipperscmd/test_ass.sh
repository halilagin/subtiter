test_rounded_box() {
    export USER_ID=2f4e1723-cda8-430f-b014-466e227e6f8b
    export VIDEO_ID=22f83152-c082-4c32-a6c4-e707780dd098
    cropped_video_dir=../klippers_warehouse/$USER_ID/$VIDEO_ID/videos-cropped-stacked
    ass_file=segment_1.ass
    input_video=segment_1.mp4
    input_video_path=$cropped_video_dir/$input_video
    ass_file_path=$cropped_video_dir/$ass_file
    output_video_path=/tmp/$input_video
    output_ass_path=/tmp/$ass_file
    animation=rounded_box
    background_color="&H0071AAB7"

    export VIDEO_WAREHOUSE_ROOT_DIR=../klippers_warehouse

    # Fancy Colour Examples
    # Sky blue: &H00EBCE87
    # Deep Teal: &H00808000
    # Vibrant Magenta: &H00D400A7
    # Goldenrod: &H0020A5DA
    # Cool Lavender: &H00FAE6E6
    # Burnt Sienna: &H005A82E9
    # Slate Blue: &H00CD5A6A
    # Mint Green: &H0071B33C
    # Crimson Red: &H003C14DC
    # Living Coral: &H00507FFF
    # Charcoal Gray: &H004F4536
    # Electric Blue: &H00FF7F00
    # Emerald Green: &H0050C878
    # Ruby Red: &H0025169A
    # Sunny Yellow: &H0000FFFF
    # Amethyst Purple: &H00D36099
    # Tangerine Orange: &H000080FF
    # Rose Gold: &H0071AAB7
    # Turquoise: &H00D0E040
    # Forest Green: &H00228B22
    # Indigo: &H0082004B

    # This script is for testing purposes.

    active_color="&H00000000"  # White
    inactive_color="&H00B469FF" # Gray
    subtitle_box_background_color="&H0000FFFF" # Black
    subtitle_box_transparency="0"      # Opaque

    # Execute the command
    sh run.sh  subtitles rounded_box \
     --ass-file $ass_file_path \
     --input-video $input_video_path \
     --video-width 1280 \
     --video-height 720 \
     --output-file $output_ass_path \
     --width-compensation 1.1 \
     --corner-radius 15 \
     --active-color "$active_color" \
     --inactive-color "$inactive_color" \
     --subtitle-box-background-color "$subtitle_box_background_color" \
     --subtitle-box-transparency "$subtitle_box_transparency"


     sh run.sh subtitles embed-ass-on-video \
     --ass-file $output_ass_path \
     --input-video $input_video_path \
     --output-video $output_video_path
}


test_regular() {
    export USER_ID=2f4e1723-cda8-430f-b014-466e227e6f8b
    export VIDEO_ID=4e5b6a12-264f-496a-b452-16f020e98169
    cropped_video_dir=../klippers_warehouse/$USER_ID/$VIDEO_ID/videos-cropped-stacked
    ass_file=segment_1.ass
    input_video=segment_1.mp4
    input_video_path=$cropped_video_dir/$input_video
    ass_file_path=$cropped_video_dir/$ass_file
    output_video_path=/tmp/$input_video
    output_ass_path=/tmp/$ass_file
    animation=rounded_box
    background_color="&H0071AAB7"

    export VIDEO_WAREHOUSE_ROOT_DIR=../klippers_warehouse

    # Fancy Colour Examples
    # Sky blue: &H00EBCE87
    # Deep Teal: &H00808000
    # Vibrant Magenta: &H00D400A7
    # Goldenrod: &H0020A5DA
    # Cool Lavender: &H00FAE6E6
    # Burnt Sienna: &H005A82E9
    # Slate Blue: &H00CD5A6A
    # Mint Green: &H0071B33C
    # Crimson Red: &H003C14DC
    # Living Coral: &H00507FFF
    # Charcoal Gray: &H004F4536
    # Electric Blue: &H00FF7F00
    # Emerald Green: &H0050C878
    # Ruby Red: &H0025169A
    # Sunny Yellow: &H0000FFFF
    # Amethyst Purple: &H00D36099
    # Tangerine Orange: &H000080FF
    # Rose Gold: &H0071AAB7
    # Turquoise: &H00D0E040
    # Forest Green: &H00228B22
    # Indigo: &H0082004B

    # This script is for testing purposes.

    active_color="&H00D36099"  # White
    inactive_color="&H00FFFFFF" # Gray
    subtitle_box_background_color="&H00000000" # Black
    subtitle_box_transparency="255"      # Semi-transparent

    # Execute the command
    sh run.sh  subtitles regular \
     --ass-file $ass_file_path \
     --input-video $input_video_path \
     --video-width 1280 \
     --video-height 720 \
     --output-file $output_ass_path \
     --width-compensation 1.1 \
     --corner-radius 15 \
     --active-color "$active_color" \
     --inactive-color "$inactive_color" \
     --subtitle-box-background-color "$subtitle_box_background_color" \
     --subtitle-box-transparency $subtitle_box_transparency \
     --position "top"


     sh run.sh subtitles embed-ass-on-video \
     --ass-file $output_ass_path \
     --input-video $input_video_path \
     --output-video $output_video_path
}




test_message_box() {
    export USER_ID=2f4e1723-cda8-430f-b014-466e227e6f8b
    export VIDEO_ID=b25a9a47-719e-4581-8446-68fc8fc3cdc6
    cropped_video_dir=../klippers_warehouse/$USER_ID/$VIDEO_ID/videos-cropped-stacked
    ass_file=segment_1.ass
    input_video=segment_1.mp4
    input_video_path=$cropped_video_dir/$input_video
    ass_file_path=$cropped_video_dir/$ass_file
    output_video_path=/tmp/$input_video
    output_ass_path=/tmp/$ass_file

    export VIDEO_WAREHOUSE_ROOT_DIR=../klippers_warehouse

    active_color="&H00000000"  # Black for active text
    inactive_color="&H00FFFFFF" # White for inactive text
    subtitle_box_background_color="&H0071AAB7" # Rose Gold
    subtitle_box_transparency="0"      # Opaque

    # Execute the command
    sh run.sh subtitles message_box \
     --ass-file "$ass_file_path" \
     --input-video "$input_video_path" \
     --video-width 1280 \
     --video-height 720 \
     --output-file "$output_ass_path" \
     --width-compensation 1.1 \
     --corner-radius 25 \
     --padding 15 \
     --active-color "$active_color" \
     --inactive-color "$inactive_color" \
     --subtitle-box-background-color "$subtitle_box_background_color" \
     --subtitle-box-transparency "$subtitle_box_transparency" \
     --position "middle"


     sh run.sh subtitles embed-ass-on-video \
     --ass-file "$output_ass_path" \
     --input-video "$input_video_path" \
     --output-video "$output_video_path"
}

# test_rounded_box
# test_regular

test_message_box