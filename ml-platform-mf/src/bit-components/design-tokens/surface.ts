import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const surface = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    surface: {
      ds_surface_primary_background_color:
        aliasToken.background.surface.ds_alias_surface_primary_background_color,
      ds_surface_secondary_background_color:
        aliasToken.background.surface
          .ds_alias_surface_secondary_background_color,
      ds_surface_tertiary_background_color:
        aliasToken.background.surface
          .ds_alias_surface_tertiary_background_color,
      ds_surface_overlay_background_color:
        aliasToken.background.generic.ds_alias_overlay_background_color
    },
    blur: {ds_surface_overlay_blur: aliasToken.blur.ds_alias_static_blur_120},
    ds_surface_overlay_opacity: aliasToken.opacity.ds_alias_static_opacity_50
  }
}
