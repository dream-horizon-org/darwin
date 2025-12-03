import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const breadcrumbs = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    breadcrumbs: {
      text: {
        ds_breadcrumbs_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_disable_text_color,
        ds_breadcrumbs_active_text_color:
          aliasToken.text.cta_primary.ds_alias_cta_primary_active_text_color,
        ds_breadcrumbs_hover_text_color:
          aliasToken.text.cta_primary.ds_alias_cta_primary_hover_text_color
      },
      border: {
        ds_breadcrumbs_hover_border_color:
          aliasToken.border.cta_primary.ds_alias_cta_primary_hover_border_color
      },
      icon: {
        ds_breadcrumbs_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_tertiary_icon_color
      }
    },
    ds_breadcrumbs_icon_size: aliasToken.sizing.ds_alias_static_size_16,
    ds_breadcrumbs_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_breadcrumbs_border_style:
        aliasToken.border.style.ds_alias_static_border_style_dashed
    },
    border_edge: {
      ds_breadcrumbs_border_edge:
        aliasToken.border.edge.ds_alias_static_border_edge_rounded
    }
  }
}
