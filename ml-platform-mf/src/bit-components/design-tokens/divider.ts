import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const divider = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    divider: {
      ds_divider_border_generic_color:
        aliasToken.border.surface.ds_alias_surface2_border_color
    },
    border_style: {
      ds_divider_horizontal_border_solid:
        aliasToken.border.style.ds_alias_static_border_style_solid,
      ds_divider_vertical_border_solid:
        aliasToken.border.style.ds_alias_static_border_style_solid,
      ds_divider_horizontal_border_dashed:
        aliasToken.border.style.ds_alias_static_border_style_dashed,
      ds_divider_vertical_border_dashed:
        aliasToken.border.style.ds_alias_static_border_style_dashed
    },
    ds_divider_horizontal_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    ds_divider_vertical_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1
  }
}
