import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const header = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_header_container_medium_height:
      aliasToken.sizing.ds_alias_static_size_64,
    ds_header_container_large_height: aliasToken.sizing.ds_alias_static_size_72,
    ds_header_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_16,
    ds_header_title_left_spacing: aliasToken.spacing.ds_alias_static_space_16,
    ds_header_title_supporter_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_header_title_bottom_spacing: aliasToken.spacing.ds_alias_static_space_4,
    ds_header_right_action_container_left_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_header_right_action_container_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_header_vertical_divider_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_32,
    header: {
      text: {
        ds_header_title_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color,
        ds_header_subtitle_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default2_text_color
      }
    },
    ds_header_scroll_view_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_80,
    ds_header_scroll_view_background_shadow: '0px 4px 20px 0px #00000035',
    blur: {
      ds_header_scroll_view_background_blur:
        aliasToken.blur.ds_alias_static_blur_24
    }
  }
}
