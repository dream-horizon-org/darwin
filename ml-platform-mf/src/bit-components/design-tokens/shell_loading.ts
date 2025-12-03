import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const shell_loading = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    shell_loading: {
      ds_shell_loading_background_color:
        aliasToken.background.surface
          .ds_alias_surface_gradient3_background_color
    },
    ds_shell_loading_radius: aliasToken.borderRadius.ds_alias_static_radius_4
  }
}
