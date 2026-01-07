

from .short_config_model import SubtitleConfiguration


default_subtitle_configuration = SubtitleConfiguration(
    subtitle_style="default",
    subtitle_position="middle",
    subtitle_box_width_compensation=1.1,
    subtitle_box_background_color="&H00EBCE87",
    subtitle_box_transparency=255,
    subtitle_box_corner_radius=15,
    subtitle_box_border_thickness=25,
    subtitle_font_size=48,
    subtitle_font_name="Arial",
    subtitle_font_bold=True,
)