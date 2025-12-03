import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const table = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_table_cell_container_large_height:
      aliasToken.sizing.ds_alias_static_size_72,
    ds_table_cell_container_maxwidth:
      aliasToken.sizing.ds_alias_static_size_400,
    ds_table_cell_text_container_max_height:
      aliasToken.sizing.ds_alias_static_size_32,
    ds_table_cell_text_container_min_height:
      aliasToken.sizing.ds_alias_static_size_16,
    ds_table_cell_container_medium_height:
      aliasToken.sizing.ds_alias_static_size_56,
    ds_table_cell_container_small_height:
      aliasToken.sizing.ds_alias_static_size_48,
    ds_table_title_container_height: aliasToken.sizing.ds_alias_static_size_48,
    ds_table_title_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_table_cell_small_icon_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_table_cell_medium_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_table_cell_banner_height: aliasToken.sizing.ds_alias_static_size_40,
    ds_table_cell_chip_max_width: aliasToken.sizing.ds_alias_static_size_122,
    ds_table_title_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_table_title_vertical_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_table_title_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_title_checkbox_spacing: aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_large_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_table_cell_medium_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_table_cell_small_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_table_cell_large_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_medium_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_table_cell_small_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_table_cell_small_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_small_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_static_image_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_medium_icon_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_chip_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_table_cell_tag_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_textlink_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_large_medium_icon_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_table_cell_medium_medium_icon_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_table_cell_small_medium_icon_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_table_cell_large_actionable_icon_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_table_cell_medium_actionable_icon_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_small_actionable_icon_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_table_cell_large_static_image_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_table_cell_medium_static_image_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_small_static_image_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_large_checkbox_spacing:
      aliasToken.spacing.ds_alias_static_space_20,
    ds_table_cell_medium_checkbox_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_table_cell_small_checkbox_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_large_radio_button_spacing:
      aliasToken.spacing.ds_alias_static_space_20,
    ds_table_cell_medium_radio_button_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_table_cell_small_radio_button_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_table_cell_loader_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    table: {
      table_title: {
        ds_table_title_container_background_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color,
        ds_table_title_default_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_table_subtext_default_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_table_title_default_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color,
        ds_table_title_error_icon_color:
          aliasToken.icon.accent.ds_alias_error_icon_color,
        ds_table_title_success_icon_color:
          aliasToken.icon.accent.ds_alias_success_icon_color,
        ds_table_title_warning_text_color:
          aliasToken.text.accent.ds_alias_warning_text_color,
        ds_table_title_disable_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_secondary_icon_color
      },
      table_border: {
        ds_table_border:
          aliasToken.border.surface.ds_alias_surface2_border_color
      },
      table_cell: {
        ds_table_cell_container_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color,
        ds_table_cell_container_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_table_cell_container_active_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_selected_background_color,
        ds_table_cell_container_success_background_color:
          aliasToken.background.cta_accent
            .ds_alias_cta_success_background_color,
        ds_table_cell_default_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
      }
    },
    ds_table_cell_container_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_10,
    ds_table_cell_container_active_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_30,
    ds_table_cell_container_success_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_15
  }
}
