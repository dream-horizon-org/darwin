import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const checkbox = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    checkbox: {
      icon: {
        ds_checkbox_default_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default3_icon_color,
        ds_checkbox_disable_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color,
        ds_checkbox_active_color:
          aliasToken.icon.cta_primary.ds_alias_cta_primary_hover2_icon_color
      },
      text: {
        ds_checkbox_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_checkbox_disable_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_disable_text_color
      },
      background: {
        ds_checkbox_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_checkbox_active_hover_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color
      }
    },
    ds_checkbox_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_checkbox_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_checkbox_text_left_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_checkbox_background_radius:
      aliasToken.borderRadius.ds_alias_static_radius_pill
  }
}
