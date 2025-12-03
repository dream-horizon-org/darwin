import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const node = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_node_dot_default_size: aliasToken.sizing.ds_alias_static_size_8,
    ds_node_dot_hover_size: aliasToken.sizing.ds_alias_static_size_10,
    ds_node_small_height: aliasToken.sizing.ds_alias_static_size_48,
    ds_node_medium_height: aliasToken.sizing.ds_alias_static_size_80,
    ds_node_action_icon_size: aliasToken.sizing.ds_alias_static_size_28,
    ds_node_medium_database_icon_size:
      aliasToken.sizing.ds_alias_static_size_24,
    ds_node_small_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_node_small_vertical_spacing: aliasToken.spacing.ds_alias_static_space_14,
    ds_node_medium_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_node_medium_vertical_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_node_action_icon_top_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_node_action_icon_right_padding:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_node_action_icon_internal_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_node_medium_database_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_node_label_bottom_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_node_label_left_padding: aliasToken.spacing.ds_alias_static_space_4,
    ds_node_medium_name_container_internal_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_node_medium_name_container_bottom_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    node: {
      background: {
        ds_node_default_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_node_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_node_selected_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_node_action_icon_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color,
        ds_node_medium_name_container_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color,
        ds_node_dot_default_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_node_dot_active_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color,
        ds_node_dot_error_background_color:
          aliasToken.background.cta_accent.ds_alias_cta_error_background_color
      },
      border: {
        ds_node_hover_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_hover_border_color,
        ds_node_selected_border_color:
          aliasToken.border.cta_accent.ds_alias_cta_focus_border_color,
        ds_node_error_border_color:
          aliasToken.border.cta_accent.ds_alias_cta_error_border_color,
        ds_node_action_icon_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color,
        ds_node_dot_border_color:
          aliasToken.border.surface.ds_alias_surface4_border_color
      },
      text: {
        ds_node_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color
      },
      icon: {
        ds_node_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color
      }
    },
    ds_node_radius: aliasToken.borderRadius.ds_alias_static_radius_8,
    ds_node_name_container_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_node_border_width: aliasToken.borderWidth.ds_alias_static_border_1,
    ds_node_dot_border_width: aliasToken.borderWidth.ds_alias_static_border_2,
    ds_node_default_hover_border_opacity:
      aliasToken.opacity.ds_alias_static_opacity_25,
    border_style: {
      ds_node_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    }
  }
}
