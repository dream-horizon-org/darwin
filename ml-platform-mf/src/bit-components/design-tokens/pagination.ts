import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const pagination = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    pagination: {
      ds_pagination_label_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color
    },
    ds_pagination_dropdown_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_pagination_dropdown_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_pagination_divider_left_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_pagination_divider_right_spacing:
      aliasToken.spacing.ds_alias_static_space_20,
    ds_pagination_dropdown_left_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4
  }
}
