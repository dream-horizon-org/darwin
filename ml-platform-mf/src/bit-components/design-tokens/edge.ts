import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const edge = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    edge: {
      ds_edge_default_border_color:
        aliasToken.border.cta_secondary
          .ds_alias_cta_secondary_default2_border_color,
      ds_edge_error_border_color:
        aliasToken.border.cta_accent.ds_alias_cta_error_border_color,
      ds_edge_active_border_color:
        aliasToken.border.cta_accent.ds_alias_cta_focus_border_color
    },
    ds_edge_border_width: aliasToken.borderWidth.ds_alias_static_border_2,
    border_style: {
      ds_edge_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    }
  }
}
