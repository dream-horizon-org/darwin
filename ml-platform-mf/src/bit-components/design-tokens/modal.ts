import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const modal = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    modal: {
      ds_modal_background_color:
        aliasToken.background.surface.ds_alias_surface_primary_background_color,
      ds_modal_header_title_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
      ds_modal_header_body_text_color:
        aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color
    },
    ds_modal_header_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_32,
    ds_modal_header_top_spacing: aliasToken.spacing.ds_alias_static_space_24,
    ds_modal_header_bottom_spacing: aliasToken.spacing.ds_alias_static_space_32,
    ds_modal_header_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_40,
    ds_modal_header_image_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_modal_footer_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_modal_footer_right_spacing: aliasToken.spacing.ds_alias_static_space_32,
    ds_modal_footer_primary_button_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_modal_header_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_modal_subtitle_width: aliasToken.sizing.ds_alias_static_size_436,
    ds_modal_radius: aliasToken.borderRadius.ds_alias_static_radius_8,
    shadow: {ds_modal_shadow: aliasToken.shadow.ds_alias_static_shadow_3}
  }
}
