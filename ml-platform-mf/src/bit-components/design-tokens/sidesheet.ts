import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const sidesheet = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_sidesheet_small_width: aliasToken.sizing.ds_alias_static_size_360,
    ds_sidesheet_medium_width: aliasToken.sizing.ds_alias_static_size_606,
    ds_sidesheet_large_width: aliasToken.sizing.ds_alias_static_size_1026,
    ds_sidesheet_extra_large_width: aliasToken.sizing.ds_alias_static_size_1236,
    sidesheet: {
      background: {
        ds_sidesheet_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color
      }
    }
  }
}
