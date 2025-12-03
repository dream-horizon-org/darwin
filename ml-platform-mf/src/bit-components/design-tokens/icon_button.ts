import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const icon_button = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    icon_button: {
      primary: {
        background: {
          ds_icon_button_primary_default_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_active_background_color,
          ds_icon_button_primary_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color,
          ds_icon_button_primary_clicked_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_clicked_background_color,
          ds_icon_button_primary_disabled_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_disable_background_color
        },
        icon: {
          ds_icon_button_primary_default_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_icon_button_primary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_icon_button_primary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_icon_button_primary_disabled_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        }
      },
      secondary: {
        background: {
          ds_icon_button_secondary_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color,
          ds_icon_button_secondary_clicked_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_clicked_background_color
        },
        border: {
          ds_icon_button_secondary_default_border_color:
            aliasToken.border.cta_primary
              .ds_alias_cta_primary_default_border_color,
          ds_icon_button_secondary_disabled_border_color:
            aliasToken.border.cta_secondary
              .ds_alias_cta_secondary_disable2_border_color
        },
        icon: {
          ds_icon_button_secondary_default_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_icon_button_secondary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_icon_button_secondary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_icon_button_secondary_disabled_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        }
      }
    },
    ds_icon_button_large_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_icon_button_medium_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_icon_button_small_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_icon_button_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_icon_button_secondary_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_icon_button_secondary_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_icon_button_large_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_icon_button_medium_icon_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_icon_button_small_icon_size: aliasToken.sizing.ds_alias_static_size_16
  }
}
