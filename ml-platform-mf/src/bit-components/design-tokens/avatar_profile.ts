import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const avatar_profile = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    avatar_profile: {
      background: {
        ds_avatar_profile_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color
      },
      icon: {
        ds_avatar_profile_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_tertiary_icon_color
      },
      text: {
        ds_avatar_profile_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
      },
      border: {
        ds_avatar_profile_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color
      }
    }
  }
}
