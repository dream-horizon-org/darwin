import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const footer = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_footer_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_24,
    ds_footer_vertical_spacing: aliasToken.spacing.ds_alias_static_space_16,
    ds_footer_right_action_container_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_footer_left_container_right_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    footer: {
      background: {
        ds_footer_background_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color
      },
      text: {
        ds_footer_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color
      }
    },
    ds_footer_background_opacity: aliasToken.opacity.ds_alias_static_opacity_60,
    blur: {
      ds_footer_background_blur: aliasToken.blur.ds_alias_static_blur_120
    }
  }
}
