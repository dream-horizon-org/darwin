import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const button = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    button: {
      primary: {
        background: {
          ds_button_primary_default_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_active_background_color,
          ds_button_primary_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color,
          ds_button_primary_clicked_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_clicked_background_color,
          ds_button_primary_disabled_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_disable_background_color
        },
        text: {
          ds_button_primary_default_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_primary_hover_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_primary_clicked_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_primary_disable_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_disable_text_color
        },
        icon: {
          ds_button_primary_default_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_primary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_primary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_primary_disabled_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        }
      },
      secondary: {
        background: {
          ds_button_secondary_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color,
          ds_button_secondary_clicked_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_clicked_background_color
        },
        border: {
          ds_button_secondary_default_border_color:
            aliasToken.border.cta_primary
              .ds_alias_cta_primary_default_border_color,
          ds_button_secondary_disabled_border_color:
            aliasToken.border.cta_secondary
              .ds_alias_cta_secondary_disable_border_color
        },
        text: {
          ds_button_secondary_default_text_color:
            aliasToken.text.cta_primary.ds_alias_cta_primary_default_text_color,
          ds_button_secondary_hover_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_secondary_clicked_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_secondary_disable_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_disable_text_color
        },
        icon: {
          ds_button_secondary_default_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_button_secondary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_secondary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_secondary_disabled_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        }
      },
      tertiary: {
        background: {
          ds_button_tertiary_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color,
          ds_button_tertiary_clicked_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_clicked_background_color
        },
        text: {
          ds_button_tertiary_default_text_color:
            aliasToken.text.cta_primary.ds_alias_cta_primary_default_text_color,
          ds_button_tertiary_hover_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_tertiary_clicked_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_button_tertiary_disable_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_disable_text_color
        },
        icon: {
          ds_button_tertiary_default_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_button_tertiary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_tertiary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_active_icon_color,
          ds_button_tertiary_disabled_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        }
      }
    },
    ds_button_large_no_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_button_large_no_icon_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_button_medium_no_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_medium_no_icon_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_button_small_no_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_small_no_icon_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_large_with_leading_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_large_with_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_button_large_with_leading_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_button_medium_with_leading_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_medium_with_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_button_medium_with_leading_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_small_with_leading_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_button_small_with_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_small_with_leading_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_large_with_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_large_with_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_button_large_with_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_button_medium_with_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_medium_with_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_button_medium_with_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_small_with_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_button_small_with_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_button_small_with_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_button_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_button_secondary_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_button_secondary_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_button_large_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_button_medium_icon_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_button_small_icon_size: aliasToken.sizing.ds_alias_static_size_16
  }
}
