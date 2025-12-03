import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const dropdown = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    dropdown_menu: {
      ds_dropdown_menu_background_color:
        aliasToken.background.surface.ds_alias_surface_primary_background_color,
      ds_dropdown_menu_border_color:
        aliasToken.border.surface.ds_alias_surface2_border_color
    },
    ds_dropdown_menu_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_90,
    blur: {
      ds_dropdown_menu_background_blur: aliasToken.blur.ds_alias_static_blur_24
    },
    ds_dropdown_menu_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_dropdown_menu_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_dropdown_menu_list_item_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_1,
    ds_dropdown_top_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_dropdown_chip_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_dropdown_chip_vertical_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_dropdown_divider_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    shadow: {ds_dropdown_shadow: aliasToken.shadow.ds_alias_static_shadow_2}
  }
}
