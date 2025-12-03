import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const stepper = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    stepper: {
      background: {
        ds_stepper_icon_default_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_stepper_icon_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_stepper_icon_clicked_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_clicked_background_color,
        ds_stepper_icon_active_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color,
        ds_stepper_icon_completed_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_selected_background_color,
        ds_stepper_icon_completed_hover_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color,
        ds_stepper_icon_completed_clicked_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_clicked_background_color,
        ds_stepper_icon_error_background_color:
          aliasToken.background.cta_accent.ds_alias_cta_error_background_color
      },
      border: {
        ds_stepper_icon_completed_border_color:
          aliasToken.border.cta_primary.ds_alias_cta_primary_active_border_color
      },
      text: {
        ds_stepper_icon_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default1_text_color,
        ds_stepper_active_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_stepper_default_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_stepper_error_text_color:
          aliasToken.text.accent.ds_alias_error_text_color
      },
      icon: {
        ds_stepper_icon_default_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color,
        ds_stepper_icon_active_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_active_icon_color,
        ds_stepper_icon_success_icon_color:
          aliasToken.icon.accent.ds_alias_success_icon_color
      }
    },
    ds_stepper_icon_completed_border_opacaity:
      aliasToken.opacity.ds_alias_static_opacity_20,
    ds_stepper_icon_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_stepper_icon_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_stepper_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_stepper_icon_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_stepper_icon_background_size: aliasToken.sizing.ds_alias_static_size_32,
    ds_stepper_icon_radius: aliasToken.borderRadius.ds_alias_static_radius_pill,
    ds_stepper_icon_complete_icon_size:
      aliasToken.sizing.ds_alias_static_size_20,
    ds_stepper_state_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_stepper_state_divider_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_stepper_state_title_bottom_spacing:
      aliasToken.spacing.ds_alias_static_space_2
  }
}
