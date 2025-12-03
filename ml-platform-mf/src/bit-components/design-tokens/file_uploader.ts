import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const file_uploader = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    file_uploader: {
      background: {
        ds_thumbnail_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color,
        ds_file_uploader_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color
      },
      text: {
        ds_file_uploader_default_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_file_uploader_default_assistive_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_file_uploader_uploaded_title_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_file_uploader_uploaded_subtitle_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color,
        ds_file_uploader_error_assistive_text_color:
          aliasToken.text.accent.ds_alias_error_text_color
      },
      icon: {
        ds_thumbnail_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color,
        ds_file_uploader_icon_color:
          aliasToken.icon.onsurface.ds_alias_surface_secondary_icon_color
      },
      border: {
        ds_file_uploader_default_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_default2_border_color,
        ds_file_uploader_error_border_color:
          aliasToken.border.accent.ds_alias_error_border_color
      }
    },
    ds_thumbnail_icon_size: aliasToken.sizing.ds_alias_static_size_32,
    ds_thumbnail_shell_loading_size: aliasToken.sizing.ds_alias_static_size_80,
    ds_text_shell_loading_height: aliasToken.sizing.ds_alias_static_size_16,
    ds_file_uploader_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_file_uploader_thumbnail_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_file_uploader_thumbnail_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_file_uploader_spacing: aliasToken.spacing.ds_alias_static_space_12,
    ds_file_uploader_icon_bottom_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_file_uploader_default_text_bottom_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_file_uploader_assistive_text_top_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_file_uploader_thumbnail_right_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_file_uploader_text_loading_vertical_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_file_uploader_uploaded_title_bottom_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_file_uploader_delete_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_thumbnail_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_file_uploader_radius: aliasToken.borderRadius.ds_alias_static_radius_8,
    ds_file_uploader_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_file_uploader_border_style:
        aliasToken.border.style.ds_alias_static_border_style_dashed
    }
  }
}
