import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const list_item = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    list_item: {
      background: {
        ds_list_item_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color,
        ds_list_item_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_list_item_selected_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_selected_background_color,
        ds_list_item_disable_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_disable_background_color
      },
      text: {
        ds_list_item_title_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_list_item_subtitle_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_list_item_disable_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color
      },
      border: {
        ds_list_item_default_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color,
        ds_list_item_disable_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color,
        ds_list_item_selected_border_color:
          aliasToken.border.accent.ds_alias_focus_border_color
      }
    },
    ds_list_item_small_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_list_item_small_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_list_item_medium_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_list_item_medium_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_list_item_action_area_container_left_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_list_item_border_weight: aliasToken.borderWidth.ds_alias_static_border_1,
    ds_list_item_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    border_style: {
      ds_list_item_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    }
  }
}
