import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const textlink = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    textlink: {
      text: {
        ds_textlink_primary_active_text_color:
          aliasToken.text.cta_primary.ds_alias_cta_primary_active_text_color,
        ds_textlink_primary_hover_text_color:
          aliasToken.text.cta_primary.ds_alias_cta_primary_hover_text_color,
        ds_textlink_disable_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_disable_text_color,
        ds_textlink_secondary_active_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_textlink_secondary_hover_text_color:
          aliasToken.text.cta_secondary.ds_alias_cta_secondary_hover_text_color
      },
      border: {
        ds_textlink_primary_hover_border_color:
          aliasToken.border.cta_primary.ds_alias_cta_primary_hover_border_color,
        ds_textlink_secondary_hover_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_hover_border_color
      },
      icon: {
        ds_textlink_primary_active_icon_color:
          aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
        ds_textlink_primary_hover_icon_color:
          aliasToken.icon.cta_primary.ds_alias_cta_primary_hover2_icon_color,
        ds_textlink_disable_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color,
        ds_textlink_secondary_active_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default2_icon_color,
        ds_textlink_secondary_hover_icon_color:
          aliasToken.icon.cta_secondary.ds_alias_cta_secondary_hover2_icon_color
      }
    },
    ds_textlink_icon_size: aliasToken.sizing.ds_alias_static_size_16,
    ds_textlink_border_weight: aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_textlink_border_style:
        aliasToken.border.style.ds_alias_static_border_style_dashed
    },
    border_edge: {
      ds_textlink_border_edge:
        aliasToken.border.edge.ds_alias_static_border_edge_rounded
    },
    ds_textlink_icon_left_spacing: aliasToken.spacing.ds_alias_static_space_2
  }
}
