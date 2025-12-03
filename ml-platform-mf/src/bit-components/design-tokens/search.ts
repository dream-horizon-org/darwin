import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const search = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    search_by: {
      ds_search_by_background_color:
        aliasToken.background.surface
          .ds_alias_surface_secondary_background_color,
      ds_search_by_text_color:
        aliasToken.text.cta_secondary
          .ds_alias_cta_secondary_default2_text_color,
      ds_search_by_icon_color:
        aliasToken.icon.cta_secondary.ds_alias_cta_secondary_default2_icon_color
    },
    ds_search_by_vertical_spacing: aliasToken.spacing.ds_alias_static_space_10,
    ds_search_by_left_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_search_by_right_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_search_by_icon_left_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_search_by_icon_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_search_by_top_left_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_search_by_bottom_left_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_search_by_top_right_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_search_by_bottom_right_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    search: {
      ds_search_background_color:
        aliasToken.background.surface.ds_alias_surface_primary_background_color,
      ds_search_default_border_color:
        aliasToken.border.cta_secondary
          .ds_alias_cta_secondary_default2_border_color,
      ds_search_label_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
      ds_search_focus_border_color:
        aliasToken.border.cta_accent.ds_alias_cta_focus_border_color,
      ds_search_input_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
    },
    ds_search_left_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_search_right_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_search_vertical_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_search_primary_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_search_border_weight: aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_search_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_search_radius: aliasToken.borderRadius.ds_alias_static_radius_4
  }
}
