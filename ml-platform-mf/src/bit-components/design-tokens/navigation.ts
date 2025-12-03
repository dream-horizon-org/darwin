import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const navigation = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    nav: {
      background: {
        ds_nav_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color,
        ds_nav_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_nav_selected_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_selected_background_color,
        ds_nav_selected_border_color:
          aliasToken.border.accent.ds_alias_focus_border_color
      },
      icon: {
        ds_nav_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
      },
      text: {
        ds_nav_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
      }
    }
  }
}
