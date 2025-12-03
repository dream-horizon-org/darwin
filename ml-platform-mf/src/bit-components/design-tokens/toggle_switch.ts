import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const toggle_switch = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    toggle_switch: {
      default: {
        ds_toggle_switch_default_base_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_toggle_switch_default_control_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default1_background_color
      },
      default_hover: {
        ds_toggle_switch_default_base_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_toggle_switch_default_control_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default1_background_color,
        ds_toggle_switch_default_control_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color
      },
      active: {
        ds_toggle_switch_active_base_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color,
        ds_toggle_switch_active_control_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color
      },
      active_hover: {
        ds_toggle_switch_active_base_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color,
        ds_toggle_switch_active_control_hover_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color,
        ds_toggle_switch_active_control_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color
      },
      disable: {
        ds_toggle_switch_disable_base_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_disable_background_color,
        ds_toggle_switch_disable_control_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_selected_background_color
      }
    },
    ds_toggle_switch_default_control_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_40,
    ds_toggle_switch_control_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_toggle_switch_base_height: aliasToken.sizing.ds_alias_static_size_14,
    ds_toggle_switch_base_width: aliasToken.sizing.ds_alias_static_size_34,
    ds_toggle_switch_control_right_spacing:
      aliasToken.spacing.ds_alias_static_space_14,
    ds_toggle_switch_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_toggle_switch_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_toggle_switch_base_radius:
      aliasToken.borderRadius.ds_alias_static_radius_pill,
    ds_toggle_switch_control_radius:
      aliasToken.borderRadius.ds_alias_static_radius_pill,
    ds_toggle_switch_control_hover_background_size:
      aliasToken.sizing.ds_alias_static_size_28,
    ds_toggle_switch_active_control_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_20
  }
}
