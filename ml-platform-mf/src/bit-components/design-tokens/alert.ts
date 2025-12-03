import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const alert = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    alert: {
      ticker: {
        background: {
          ds_ticker_success_background_color:
            aliasToken.background.generic.ds_alias_success_background_color,
          ds_ticker_information_background_color:
            aliasToken.background.generic.ds_alias_information_background_color,
          ds_ticker_error_background_color:
            aliasToken.background.generic.ds_alias_error_background_color,
          ds_ticker_warning_background_color:
            aliasToken.background.generic.ds_alias_warning_background_color
        },
        icon: {
          ds_ticker_success_icon_color:
            aliasToken.icon.accent.ds_alias_success_icon_color,
          ds_ticker_information_icon_color:
            aliasToken.icon.accent.ds_alias_information_icon_color,
          ds_ticker_error_icon_color:
            aliasToken.icon.accent.ds_alias_error_icon_color,
          ds_ticker_warning_icon_color:
            aliasToken.icon.accent.ds_alias_warning_icon_color
        },
        text: {
          ds_ticker_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
        }
      },
      snackbar: {
        background: {
          ds_snackbar_success_background_color:
            aliasToken.background.generic.ds_alias_success_background_color,
          ds_snackbar_information_background_color:
            aliasToken.background.generic.ds_alias_information_background_color,
          ds_snackbar_error_background_color:
            aliasToken.background.generic.ds_alias_error_background_color,
          ds_snackbar_warning_background_color:
            aliasToken.background.generic.ds_alias_warning_background_color
        },
        icon: {
          ds_snackbar_success_icon_color:
            aliasToken.icon.accent.ds_alias_success_icon_color,
          ds_snackbar_information_icon_color:
            aliasToken.icon.accent.ds_alias_information_icon_color,
          ds_snackbar_error_icon_color:
            aliasToken.icon.accent.ds_alias_error_icon_color,
          ds_snackbar_warning_icon_color:
            aliasToken.icon.accent.ds_alias_warning_icon_color
        },
        text: {
          ds_snackbar_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
        }
      }
    },
    ds_ticker_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_ticker_vertical_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_ticker_icon_right_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_snackbar_text_right_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_ticker_text_button_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_snackbar_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_snackbar_vertical_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_snackbar_icon_right_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_snackbar_text_button_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_ticker_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_snackbar_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_ticker_radius: aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_snackbar_radius: aliasToken.borderRadius.ds_alias_static_radius_pill
  }
}
