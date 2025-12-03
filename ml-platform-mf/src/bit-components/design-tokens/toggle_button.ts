import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const toggle_button = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_toggle_button_left_top_right_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_toggle_button_right_top_left_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_toggle_button_left_bottom_right_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_toggle_button_right_bottom_left_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_toggle_button_left_bottom_left_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_toggle_button_left_top_left_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_toggle_button_right_top_right_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_toggle_button_right_bottom_right_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    border_style: {
      ds_toggle_button_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_toggle_button_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    ds_toggle_button_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_toggle_button_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    toggle_button: {
      default: {
        ds_toggle_button_default_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_default2_border_color,
        ds_toggle_button_default2_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_toggle_button_default_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default3_icon_color
      },
      disable: {
        ds_toggle_button_disable_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_disable_border_color,
        ds_toggle_button_disable_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color,
        ds_toggle_button_disable_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_disable_text_color
      },
      hover: {
        ds_toggle_button_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_toggle_button_hover_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color
      },
      active: {
        ds_toggle_button_active_border_color:
          aliasToken.border.cta_primary
            .ds_alias_cta_primary_active_border_color,
        ds_toggle_button_active_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default1_text_color,
        ds_toggle_button_active_background_color_copy:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color,
        ds_toggle_button_active_icon_color:
          aliasToken.icon.cta_secondary.ds_alias_cta_secondary_active_icon_color
      },
      success: {
        ds_toggle_button_success_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_toggle_button_success_border_color:
          aliasToken.border.cta_accent.ds_alias_cta_success_border_color,
        ds_toggle_button_success_background_color:
          aliasToken.background.generic.ds_alias_success_background_color,
        ds_toggle_button_success_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
      },
      error: {
        ds_toggle_button_error_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_toggle_button_error_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color,
        ds_toggle_button_error_border_color:
          aliasToken.border.cta_accent.ds_alias_cta_error_border_color,
        ds_toggle_button_error_background_color:
          aliasToken.background.generic.ds_alias_error_background_color
      }
    },
    ds_toggle_button_icon_size: aliasToken.sizing.ds_alias_static_size_16
  }
}
