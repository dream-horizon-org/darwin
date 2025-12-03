import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const textarea = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    textarea: {
      text: {
        ds_textarea_default_label_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_textarea_default_assistive_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_textarea_default_counter_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_textarea_default_lnput_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_textarea_focus_label_text_color:
          aliasToken.text.focus.ds_alias_focus_text_color,
        ds_textarea_error_assistive_text_color:
          aliasToken.text.accent.ds_alias_error_text_color,
        ds_textarea_error_label_text_color:
          aliasToken.text.accent.ds_alias_error_text_color,
        ds_textarea_disable_lnput_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_textarea_disable_counter_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color,
        ds_textarea_disable_assistive_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color,
        ds_textarea_disable_label_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color
      },
      border: {
        ds_textarea_deafult_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_default2_border_color,
        ds_textarea_focus_border_color:
          aliasToken.border.cta_accent.ds_alias_cta_focus_border_color,
        ds_textarea_error_border_color:
          aliasToken.border.cta_accent.ds_alias_cta_error_border_color,
        ds_textarea_disable_border_color:
          aliasToken.border.surface.ds_alias_surface3_border_color
      },
      background: {
        ds_textarea_label_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color
      }
    },
    ds_textarea_large_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_textarea_large_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_textarea_assistive_text_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_textarea_counter_text_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_textarea_counter_text_top_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_textarea_assistive_text_top_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_textarea_label_background_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_textarea_label_left_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_textarea_small_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_textarea_small_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_textarea_chip_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_textarea_chip_vertical_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_textarea_large_input_box_height:
      aliasToken.sizing.ds_alias_static_size_104,
    ds_textarea_small_input_box_height:
      aliasToken.sizing.ds_alias_static_size_100,
    ds_textarea_border_weight: aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_textarea_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_textarea_radius: aliasToken.borderRadius.ds_alias_static_radius_4
  }
}
