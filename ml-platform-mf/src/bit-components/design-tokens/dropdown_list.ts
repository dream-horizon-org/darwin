import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const dropdown_list = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    dropdown_list: {
      default: {
        ds_dropdown_list_item_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_dropdown_list_item_subtitle_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_dropdown_list_item_default_trailing_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color,
        ds_dropdown_list_item_default_leading_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color
      },
      hover: {
        ds_dropdown_list_item_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_dropdown_list_item_hover_trailing_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_hover1_icon_color,
        ds_dropdown_list_item_hover_leading_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color,
        ds_dropdown_list_item_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color
      },
      selected: {
        ds_dropdown_list_item_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_dropdown_list_item_selected_trailing_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color,
        ds_dropdown_list_item_selected_leading_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color,
        ds_dropdown_list_item_selected_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_selected_background_color
      }
    },
    ds_dropdown_list_item_small_icon_size:
      aliasToken.sizing.ds_alias_static_size_16,
    ds_dropdown_list_item_medium_icon_size:
      aliasToken.sizing.ds_alias_static_size_32,
    ds_dropdown_list_item_trailing_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_dropdown_list_item_leading_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_dropdown_list_item_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_dropdown_list_item_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_dropdown_list_item_right_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_dropdown_list_item_subtitle_top_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_dropdown_list_item_radius:
      aliasToken.borderRadius.ds_alias_static_radius_4
  }
}
