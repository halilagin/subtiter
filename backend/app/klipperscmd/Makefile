

script_file = "clipper.py"
root_dir = "podcast-test"
mp4_file = "podcast01.mp4"
m4a_file = "$(root_dir)/$(mp4_file).m4a"
srt_file = "$(root_dir)/$(mp4_file).srt"
txt_file = "$(root_dir)/$(mp4_file).txt"
important_segments_file = "$(root_dir)/$(mp4_file).important_segments.json"
important_segments_videos_dir = "$(root_dir)/important-segment-videos"
segment_count = 10


test: create_root_dir
	@echo "test"

extract-audio:
	python clipper.py extract-audio --video-file $(mp4_file)  --audio-file $(m4a_file)

transcribe:
	python clipper.py transcribe --audio-file $(m4a_file)  --output-srt-file $(srt_file)

convert-srt-to-txt: 
	python clipper.py convert-srt-to-txt --srt-file $(srt_file)  --txt-file $(txt_file)

important-segments-json: 
	python clipper.py important-segments --input-srt $(srt_file)  --output-file $(important_segments_file) --segment-count $(segment_count)

important-segments-videos: 
	python clipper.py process --input-video  $(mp4_file)  --important-segments-file-json $(important_segments_file) --output-dir $(important_segments_videos_dir)

convert-srt-to-txt: 
	python clipper.py convert-srt-to-txt --srt-file $(srt_file)


run: 
	python clipper.py run --input-video $(mp4_file) --segment-count $(segment_count)


test_chat:
	 python clipper.py chat send -r room-1 -c test001 -m "selam"


