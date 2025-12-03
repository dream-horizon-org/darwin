import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const chip = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    chip: {
      text: {
        ds_chip_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_chip_active_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default1_text_color,
        ds_chip_disable_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color
      },
      icon: {
        ds_chip_default_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color,
        ds_chip_active_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_active_icon_color,
        ds_chip_disabled_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color
      },
      background: {
        ds_chip_default_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_chip_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_chip_disable_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_disable_background_color,
        ds_chip_active_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color,
        ds_chip_active_hover_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_hover_background_color
      }
    },
    ds_chip_small_no_icon_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_chip_small_no_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_small_with_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_chip_small_with_leading_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_small_with_leading_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_small_with_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_chip_small_with_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_small_with_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_small_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_small_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_chip_small_with_leading_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_small_with_leading_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_small_with_leading_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_medium_no_icon_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_chip_medium_no_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_medium_with_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_chip_medium_with_leading_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_medium_with_leading_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_medium_with_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_chip_medium_with_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_medium_with_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_medium_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_medium_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_chip_medium_with_leading_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_chip_medium_with_leading_trailing_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_medium_with_leading_trailing_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_chip_radius: aliasToken.borderRadius.ds_alias_static_radius_pill,
    ds_chip_small_leading_icon_size: aliasToken.sizing.ds_alias_static_size_16,
    ds_chip_medium_leading_icon_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_chip_small_trailing_icon_size: aliasToken.sizing.ds_alias_static_size_16,
    ds_chip_medium_trailing_icon_size: aliasToken.sizing.ds_alias_static_size_20
  }
}
