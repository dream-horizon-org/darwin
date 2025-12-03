import globalToken from './globalToken'
const aliasToken = {
  spacing: {
    ds_alias_static_space_1: globalToken.spacing.ds_global_space_1,
    ds_alias_static_space_2: globalToken.spacing.ds_global_space_2,
    ds_alias_static_space_4: globalToken.spacing.ds_global_space_4,
    ds_alias_static_space_6: globalToken.spacing.ds_global_space_6,
    ds_alias_static_space_8: globalToken.spacing.ds_global_space_8,
    ds_alias_static_space_10: globalToken.spacing.ds_global_space_10,
    ds_alias_static_space_12: globalToken.spacing.ds_global_space_12,
    ds_alias_static_space_14: globalToken.spacing.ds_global_space_14,
    ds_alias_static_space_16: globalToken.spacing.ds_global_space_16,
    ds_alias_static_space_18: globalToken.spacing.ds_global_space_18,
    ds_alias_static_space_20: globalToken.spacing.ds_global_space_20,
    ds_alias_static_space_24: globalToken.spacing.ds_global_space_24,
    ds_alias_static_space_28: globalToken.spacing.ds_global_space_28,
    ds_alias_static_space_32: globalToken.spacing.ds_global_space_32,
    ds_alias_static_space_36: globalToken.spacing.ds_global_space_36,
    ds_alias_static_space_40: globalToken.spacing.ds_global_space_40,
    ds_alias_static_space_44: globalToken.spacing.ds_global_space_44,
    ds_alias_static_space_48: globalToken.spacing.ds_global_space_48,
    ds_alias_static_space_52: globalToken.spacing.ds_global_space_52,
    ds_alias_static_space_56: globalToken.spacing.ds_global_space_56,
    ds_alias_static_space_64: globalToken.spacing.ds_global_space_64
  },
  background: {
    cta_primary: {
      ds_alias_cta_primary_clicked_background_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_active_background_color:
        globalToken.color.ds_global_color_blue_70,
      ds_alias_cta_primary_hover_background_color:
        globalToken.color.ds_global_color_blue_80,
      ds_alias_cta_primary_selected_background_color:
        globalToken.color.ds_global_color_blue_100
    },
    cta_secondary: {
      ds_alias_cta_secondary_default1_background_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_clicked_background_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_default2_background_color:
        globalToken.color.ds_global_color_neutral_80,
      ds_alias_cta_secondary_selected_background_color:
        globalToken.color.ds_global_color_neutral_80,
      ds_alias_cta_secondary_hover1_background_color:
        globalToken.color.ds_global_color_neutral_90,
      ds_alias_cta_secondary_disable_background_color:
        globalToken.color.ds_global_color_neutral_90,
      ds_alias_cta_secondary_hover2_background_color:
        globalToken.color.ds_global_color_neutral_100,
      ds_alias_cta_secondary_selected2_background_color:
        globalToken.color.ds_global_color_neutral_100
    },
    cta_accent: {
      ds_alias_cta_error_background_color:
        globalToken.color.ds_global_color_red_80,
      ds_alias_cta_success_background_color:
        globalToken.color.ds_global_color_green_80
    },
    generic: {
      ds_alias_success_background_color:
        globalToken.color.ds_global_color_green_80,
      ds_alias_error_background_color: globalToken.color.ds_global_color_red_80,
      ds_alias_warning_background_color:
        globalToken.color.ds_global_color_yellow_80,
      ds_alias_information_background_color:
        globalToken.color.ds_global_color_purple_80,
      ds_alias_default_background_color:
        globalToken.color.ds_global_color_neutral_80,
      ds_alias_overlay_background_color:
        globalToken.color.ds_global_color_black_100
    },
    surface: {
      ds_alias_surface_primary_background_color:
        globalToken.color.ds_global_color_neutral_100,
      ds_alias_surface_secondary_background_color:
        globalToken.color.ds_global_color_neutral_90,
      ds_alias_surface_tertiary_background_color:
        globalToken.color.ds_global_color_neutral_110,
      ds_alias_surface_gradient3_background_color:
        globalToken.color.ds_global_color_neutral_80_gradient3,
      ds_alias_surface_gradient1_background_color:
        globalToken.color.ds_global_color_neutral_100_gradient4,
      ds_alias_surface_gradient2_background_color:
        globalToken.color.ds_global_color_neutral_100_gradient5
    }
  },
  text: {
    cta_primary: {
      ds_alias_cta_primary_hover_text_color:
        globalToken.color.ds_global_color_blue_70,
      ds_alias_cta_primary_default_text_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_active_text_color:
        globalToken.color.ds_global_color_blue_50
    },
    cta_secondary: {
      ds_alias_cta_secondary_default1_text_color:
        globalToken.color.ds_global_color_neutral_10,
      ds_alias_cta_secondary_default2_text_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_cta_secondary_hover_text_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_disable_text_color:
        globalToken.color.ds_global_color_neutral_80
    },
    cta_accent: {
      ds_alias_cta_success_text_color:
        globalToken.color.ds_global_color_green_50,
      ds_alias_cta_error_text_color: globalToken.color.ds_global_color_red_60
    },
    onsurface: {
      ds_alias_onsurface_default1_text_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_onsurface_default2_text_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_onsurface_disabled_text_color:
        globalToken.color.ds_global_color_neutral_80
    },
    focus: {
      ds_alias_focus_text_color: globalToken.color.ds_global_color_blue_70
    },
    accent: {
      ds_alias_success_text_color: globalToken.color.ds_global_color_green_50,
      ds_alias_error_text_color: globalToken.color.ds_global_color_red_60,
      ds_alias_warning_text_color: globalToken.color.ds_global_color_yellow_50,
      ds_alias_information_text_color:
        globalToken.color.ds_global_color_purple_50
    }
  },
  border: {
    cta_primary: {
      ds_alias_cta_primary_active_border_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_default_border_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_hover_border_color:
        globalToken.color.ds_global_color_blue_70
    },
    cta_secondary: {
      ds_alias_cta_secondary_default1_border_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_cta_secondary_default2_border_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_hover_border_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_disable_border_color:
        globalToken.color.ds_global_color_neutral_80,
      ds_alias_cta_secondary_disable2_border_color:
        globalToken.color.ds_global_color_neutral_90
    },
    cta_accent: {
      ds_alias_cta_success_border_color:
        globalToken.color.ds_global_color_green_60,
      ds_alias_cta_error_border_color: globalToken.color.ds_global_color_red_60,
      ds_alias_cta_focus_border_color: globalToken.color.ds_global_color_blue_70
    },
    surface: {
      ds_alias_surface1_border_color: globalToken.color.ds_global_color_blue_50,
      ds_alias_surface2_border_color:
        globalToken.color.ds_global_color_neutral_90,
      ds_alias_surface3_border_color:
        globalToken.color.ds_global_color_neutral_80,
      ds_alias_surface4_border_color:
        globalToken.color.ds_global_color_neutral_110,
      ds_alias_surface_gradient1_border_color:
        globalToken.color.ds_global_color_neutral_80_gradient1,
      ds_alias_surface_gradient2_border_color:
        globalToken.color.ds_global_color_neutral_80_gradient2
    },
    accent: {
      ds_alias_success_border_color: globalToken.color.ds_global_color_green_60,
      ds_alias_error_border_color: globalToken.color.ds_global_color_red_60,
      ds_alias_focus_border_color: globalToken.color.ds_global_color_blue_70
    },
    style: {
      ds_alias_static_border_style_solid:
        globalToken.border.ds_global_border_style_solid,
      ds_alias_static_border_style_dashed:
        globalToken.border.ds_global_border_style_dashed
    },
    edge: {
      ds_alias_static_border_edge_rounded:
        globalToken.border.ds_global_border_edge_rounded,
      ds_alias_static_border_edge_sharp:
        globalToken.border.ds_global_border_edge_sharp
    }
  },
  icon: {
    cta_primary: {
      ds_alias_cta_primary_default_icon_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_hover_icon_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_clicked_icon_color:
        globalToken.color.ds_global_color_blue_50,
      ds_alias_cta_primary_hover2_icon_color:
        globalToken.color.ds_global_color_blue_70
    },
    cta_secondary: {
      ds_alias_cta_secondary_clicked1_icon_color:
        globalToken.color.ds_global_color_neutral_10,
      ds_alias_cta_secondary_active_icon_color:
        globalToken.color.ds_global_color_neutral_10,
      ds_alias_cta_secondary_default1_icon_color:
        globalToken.color.ds_global_color_neutral_10,
      ds_alias_cta_secondary_default2_icon_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_cta_secondary_hover1_icon_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_cta_secondary_clicked2_icon_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_cta_secondary_hover2_icon_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_default3_icon_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_cta_secondary_disabled_icon_color:
        globalToken.color.ds_global_color_neutral_80
    },
    accent: {
      ds_alias_success_icon_color: globalToken.color.ds_global_color_green_50,
      ds_alias_error_icon_color: globalToken.color.ds_global_color_red_50,
      ds_alias_information_icon_color:
        globalToken.color.ds_global_color_purple_50,
      ds_alias_warning_icon_color: globalToken.color.ds_global_color_yellow_50,
      ds_alias_default_icon_color: globalToken.color.ds_global_color_neutral_50
    },
    cta_accent: {
      ds_alias_cta_success_icon_color:
        globalToken.color.ds_global_color_green_50,
      ds_alias_cta_error_icon_color: globalToken.color.ds_global_color_red_60
    },
    onsurface: {
      ds_alias_surface_primary_icon_color:
        globalToken.color.ds_global_color_neutral_20,
      ds_alias_surface_secondary_icon_color:
        globalToken.color.ds_global_color_neutral_50,
      ds_alias_surface_tertiary_icon_color:
        globalToken.color.ds_global_color_neutral_80
    }
  },
  borderRadius: {
    ds_alias_static_radius_0: globalToken.borderRadius.ds_global_radius_0,
    ds_alias_static_radius_4: globalToken.borderRadius.ds_global_radius_4,
    ds_alias_static_radius_8: globalToken.borderRadius.ds_global_radius_8,
    ds_alias_static_radius_pill: globalToken.borderRadius.ds_global_radius_pill
  },
  borderWidth: {
    ds_alias_static_border_1: globalToken.borderWidth.ds_global_border_1,
    ds_alias_static_border_2: globalToken.borderWidth.ds_global_border_2,
    ds_alias_static_border_4: globalToken.borderWidth.ds_global_border_4
  },
  sizing: {
    ds_alias_static_size_8: globalToken.sizing.ds_global_size_8,
    ds_alias_static_size_10: globalToken.sizing.ds_global_size_10,
    ds_alias_static_size_12: globalToken.sizing.ds_global_size_12,
    ds_alias_static_size_14: globalToken.sizing.ds_global_size_14,
    ds_alias_static_size_16: globalToken.sizing.ds_global_size_16,
    ds_alias_static_size_18: globalToken.sizing.ds_global_size_18,
    ds_alias_static_size_20: globalToken.sizing.ds_global_size_20,
    ds_alias_static_size_24: globalToken.sizing.ds_global_size_24,
    ds_alias_static_size_28: globalToken.sizing.ds_global_size_28,
    ds_alias_static_size_32: globalToken.sizing.ds_global_size_32,
    ds_alias_static_size_34: globalToken.sizing.ds_global_size_34,
    ds_alias_static_size_40: globalToken.sizing.ds_global_size_40,
    ds_alias_static_size_48: globalToken.sizing.ds_global_size_48,
    ds_alias_static_size_56: globalToken.sizing.ds_global_size_56,
    ds_alias_static_size_64: globalToken.sizing.ds_global_size_64,
    ds_alias_static_size_72: globalToken.sizing.ds_global_size_72,
    ds_alias_static_size_80: globalToken.sizing.ds_global_size_80,
    ds_alias_static_size_100: globalToken.sizing.ds_global_size_100,
    ds_alias_static_size_968: globalToken.sizing.ds_global_size_968,
    ds_alias_static_size_104: globalToken.sizing.ds_global_size_104,
    ds_alias_static_size_122: globalToken.sizing.ds_global_size_122,
    ds_alias_static_size_240: globalToken.sizing.ds_global_size_240,
    ds_alias_static_size_292: globalToken.sizing.ds_global_size_292,
    ds_alias_static_size_300: globalToken.sizing.ds_global_size_300,
    ds_alias_static_size_360: globalToken.sizing.ds_global_size_360,
    ds_alias_static_size_396: globalToken.sizing.ds_global_size_396,
    ds_alias_static_size_400: globalToken.sizing.ds_global_size_400,
    ds_alias_static_size_436: globalToken.sizing.ds_global_size_436,
    ds_alias_static_size_606: globalToken.sizing.ds_global_size_606,
    ds_alias_static_size_1026: globalToken.sizing.ds_global_size_1026,
    ds_alias_static_size_1236: globalToken.sizing.ds_global_size_1236
  },
  font: {
    alignment: {
      ds_alias_font_align_left: globalToken.font.ds_global_font_align_left,
      ds_alias_font_align_center: globalToken.font.ds_global_font_align_center,
      ds_alias_font_align_right: globalToken.font.ds_global_font_align_right
    },
    family: {
      ds_alias_font_family_base: globalToken.font.ds_global_font_family_base,
      ds_alias_font_family_code: globalToken.font.ds_global_font_family_code
    },
    weight: {
      ds_alias_font_weight_regular:
        globalToken.font.ds_global_font_weight_regular,
      ds_alias_font_weight_bold: globalToken.font.ds_global_font_weight_bold,
      ds_alias_font_weight_regular_2:
        globalToken.font.ds_global_font_weight_regular_2
    },
    line_height: {
      ds_alias_font_line_height_14:
        globalToken.font.ds_global_font_line_height_14,
      ds_alias_font_line_height_16:
        globalToken.font.ds_global_font_line_height_16,
      ds_alias_font_line_height_20:
        globalToken.font.ds_global_font_line_height_20,
      ds_alias_font_line_height_24:
        globalToken.font.ds_global_font_line_height_24,
      ds_alias_font_line_height_28:
        globalToken.font.ds_global_font_line_height_28,
      ds_alias_font_line_height_32:
        globalToken.font.ds_global_font_line_height_32
    },
    size: {
      ds_alias_font_size_10: globalToken.font.ds_global_font_size_10,
      ds_alias_font_size_12: globalToken.font.ds_global_font_size_12,
      ds_alias_font_size_14: globalToken.font.ds_global_font_size_14,
      ds_alias_font_size_16: globalToken.font.ds_global_font_size_16,
      ds_alias_font_size_18: globalToken.font.ds_global_font_size_18,
      ds_alias_font_size_20: globalToken.font.ds_global_font_size_20,
      ds_alias_font_size_24: globalToken.font.ds_global_font_size_24
    },
    transform: {
      ds_alias_font_transform_none:
        globalToken.font.ds_global_font_transform_none,
      ds_alias_font_transform_uppercase:
        globalToken.font.ds_global_font_transform_uppercase,
      ds_alias_font_transform_sentence:
        globalToken.font.ds_global_font_transform_sentence
    },
    decoration: {
      ds_alias_font_decoration_none:
        globalToken.font.ds_global_font_decoration_none,
      ds_alias_font_decoration_underline:
        globalToken.font.ds_global_font_decoration_underline,
      ds_alias_font_decoration_line_through:
        globalToken.font.ds_global_font_decoration_line_through
    },
    letter_spacing: {
      ds_alias_font_letter_spacing_none:
        globalToken.font.ds_global_font_letter_spacing_none
    },
    paragraph_spacing: {
      ds_alias_font_paragraph_spacing_none:
        globalToken.font.ds_global_font_paragraph_spacing_none
    }
  },
  blur: {
    ds_alias_static_blur_4: globalToken.blur.ds_global_blur_4,
    ds_alias_static_blur_8: globalToken.blur.ds_global_blur_8,
    ds_alias_static_blur_12: globalToken.blur.ds_global_blur_12,
    ds_alias_static_blur_16: globalToken.blur.ds_global_blur_16,
    ds_alias_static_blur_20: globalToken.blur.ds_global_blur_20,
    ds_alias_static_blur_24: globalToken.blur.ds_global_blur_24,
    ds_alias_static_blur_32: globalToken.blur.ds_global_blur_32,
    ds_alias_static_blur_40: globalToken.blur.ds_global_blur_40,
    ds_alias_static_blur_48: globalToken.blur.ds_global_blur_48,
    ds_alias_static_blur_56: globalToken.blur.ds_global_blur_56,
    ds_alias_static_blur_64: globalToken.blur.ds_global_blur_64,
    ds_alias_static_blur_72: globalToken.blur.ds_global_blur_72,
    ds_alias_static_blur_80: globalToken.blur.ds_global_blur_80,
    ds_alias_static_blur_88: globalToken.blur.ds_global_blur_88,
    ds_alias_static_blur_96: globalToken.blur.ds_global_blur_96,
    ds_alias_static_blur_120: globalToken.blur.ds_global_blur_120,
    ds_alias_static_blur_132: globalToken.blur.ds_global_blur_132,
    ds_alias_static_blur_140: globalToken.blur.ds_global_blur_140
  },
  animation: {
    ds_alias_animation_immediately:
      globalToken.animation.ds_global_animation_immediately
  },
  opacity: {
    ds_alias_static_opacity_5: globalToken.opacity.ds_global_opacity_5,
    ds_alias_static_opacity_10: globalToken.opacity.ds_global_opacity_10,
    ds_alias_static_opacity_15: globalToken.opacity.ds_global_opacity_15,
    ds_alias_static_opacity_20: globalToken.opacity.ds_global_opacity_20,
    ds_alias_static_opacity_25: globalToken.opacity.ds_global_opacity_25,
    ds_alias_static_opacity_30: globalToken.opacity.ds_global_opacity_30,
    ds_alias_static_opacity_35: globalToken.opacity.ds_global_opacity_35,
    ds_alias_static_opacity_40: globalToken.opacity.ds_global_opacity_40,
    ds_alias_static_opacity_45: globalToken.opacity.ds_global_opacity_45,
    ds_alias_static_opacity_50: globalToken.opacity.ds_global_opacity_50,
    ds_alias_static_opacity_55: globalToken.opacity.ds_global_opacity_55,
    ds_alias_static_opacity_60: globalToken.opacity.ds_global_opacity_60,
    ds_alias_static_opacity_65: globalToken.opacity.ds_global_opacity_65,
    ds_alias_static_opacity_70: globalToken.opacity.ds_global_opacity_70,
    ds_alias_static_opacity_75: globalToken.opacity.ds_global_opacity_75,
    ds_alias_static_opacity_80: globalToken.opacity.ds_global_opacity_80,
    ds_alias_static_opacity_85: globalToken.opacity.ds_global_opacity_85,
    ds_alias_static_opacity_90: globalToken.opacity.ds_global_opacity_90,
    ds_alias_static_opacity_95: globalToken.opacity.ds_global_opacity_95
  },
  shadow: {
    ds_alias_static_shadow_3: globalToken.boxShadow.ds_global_shadow_3,
    ds_alias_static_shadow_4: globalToken.boxShadow.ds_global_shadow_4,
    ds_alias_static_shadow_2: globalToken.boxShadow.ds_global_shadow_2
  }
}
export default aliasToken
