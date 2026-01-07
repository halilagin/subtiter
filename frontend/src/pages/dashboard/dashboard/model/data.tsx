const sample_config_json = {
    "segment_count": 10,
    "capitalize_words": true,
    "capitalize_first_char_in_words": true,
    "video_people_context": "podcast",  // podcast,solo, vlog, interview, presentation, etc.
    "how_many_people_in_video": 1,
    "dissaminate_on_social_media": true,
    "target_short_video_length": 60,  // in seconds, -1 auto-detect
    "language_code": "en",  // auto-detect, en, tr, etc.
    "video_aspect_ratio": "16:9",  // 16:9:portrait, 9:16:landscape, 1:1:square, etc.
    "generate_engaging_captions": true,
    "use_emojis_in_ass_words": true,
    "video_type": "video",  // video, image, gif, etc.
    "video_format": "mp4",  // mp4, mov, avi, etc.
    "video_resolution": "1920x1080",  // in pixels, -1 auto-detect
    "dissaminate_on_social_media_json": {
        "facebook": false,
        "instagram": false,
        "twitter": false,
        "linkedin": false,
        "youtube": false,
        "tiktok": false,
        "pinterest": false,
        "reddit": false,
        "snapchat": false,
        "telegram": false,
    }
}


export default sample_config_json;