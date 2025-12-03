import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const text_button = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    text_button: {
      text: {
        ds_text_button_default_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_text_button_hover_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_text_button_clicked_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
      },
      background: {
        ds_text_button_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_text_button_clicked_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_clicked_background_color
      }
    },
    ds_text_button_clicked_background_color_opacity:
      aliasToken.opacity.ds_alias_static_opacity_30,
    ds_text_button_vertical_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_text_button_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_text_button_radius: aliasToken.borderRadius.ds_alias_static_radius_4
  }
}
