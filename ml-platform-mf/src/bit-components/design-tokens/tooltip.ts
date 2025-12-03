import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const tooltip = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    tooltip: {
      background: {
        ds_tooltip_background_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color
      },
      text: {
        ds_tooltip_background_color_copy:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
      }
    },
    ds_tooltip_vertical_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_tooltip_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_tooltip_radius: aliasToken.borderRadius.ds_alias_static_radius_4
  }
}
