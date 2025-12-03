import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const tab = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_tab_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_16,
    ds_tab_vertical_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_tab_counter_left_spacing: aliasToken.spacing.ds_alias_static_space_8,
    tab: {
      text: {
        ds_tab_active_text_color:
          aliasToken.text.cta_primary.ds_alias_cta_primary_active_text_color,
        ds_tab_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_tab_disable_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_disable_text_color
      },
      border: {
        ds_tab_active_border_color:
          aliasToken.border.cta_primary.ds_alias_cta_primary_active_border_color
      },
      icon: {
        ds_tab_active_icon_color:
          aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
        ds_tab_hover_icon_color:
          aliasToken.icon.cta_primary.ds_alias_cta_primary_hover_icon_color,
        ds_tab_clicked_icon_color:
          aliasToken.icon.cta_primary.ds_alias_cta_primary_clicked_icon_color,
        ds_tab_default_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default2_icon_color,
        ds_tab_disabled_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color
      },
      background: {
        ds_tab_clicked_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_selected_background_color,
        ds_tab_hover_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color
      }
    },
    minitab: {
      background: {
        ds_minitab_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color,
        ds_minitab_selected_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color,
        ds_minitab_default_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_minitab_disable_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_disable_background_color,
        ds_minitab_selected_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover2_background_color
      },
      text: {
        ds_minitab_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_minitab_disable_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_disable_text_color
      },
      icon: {
        ds_minitab_default_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default2_icon_color,
        ds_minitab_disable_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color
      }
    },
    ds_tab_border_weight: aliasToken.borderWidth.ds_alias_static_border_2,
    border_style: {
      ds_tab_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    border_edge: {
      ds_tab_border_edge:
        aliasToken.border.edge.ds_alias_static_border_edge_rounded
    },
    ds_tab_clicked_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_25,
    ds_tab_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_20,
    ds_minitab_default_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_65,
    ds_tab_icon_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_minitab_default_vertical_sapcing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_default_horizontal_sapcing:
      aliasToken.spacing.ds_alias_static_space_32,
    ds_minitab_hover_left_sapcing: aliasToken.spacing.ds_alias_static_space_32,
    ds_minitab_selected_hover_left_sapcing:
      aliasToken.spacing.ds_alias_static_space_32,
    ds_minitab_hover_right_sapcing: aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_action_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_6,
    ds_minitab_selected_hover_right_sapcing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_hover_vertical_sapcing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_icon_left_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_minitab_icon_right_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_minitab_disable_vertical_sapcing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_disable_horizontal_sapcing:
      aliasToken.spacing.ds_alias_static_space_32,
    ds_minitab_selected_horizontal_sapcing:
      aliasToken.spacing.ds_alias_static_space_32,
    ds_minitab_action_icon_vertical_sapcing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_action_icon_horizontal_sapcing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_minitab_selcted_hover_vertical_sapcing:
      aliasToken.spacing.ds_alias_static_space_2
  }
}
