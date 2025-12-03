import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const app_bar = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    appbar: {
      background: {
        ds_appbar_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color
      }
    }
  }
}
