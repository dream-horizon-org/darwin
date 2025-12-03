import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const accordion = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_accordion_min_width: aliasToken.sizing.ds_alias_static_size_396,
    ds_accordion_header_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_accordion_header_counter_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_accordion_header_subtitle_top_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_accordion_header_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_accordion_header_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_accordion_body_spacing: aliasToken.spacing.ds_alias_static_space_16,
    accordian: {
      text: {
        ds_accordion_header_title_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_accordion_header_subtitle_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_accordion_body_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color
      },
      background: {
        ds_accordion_header_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color,
        ds_accordion_header_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_accordion_body_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color
      },
      border: {
        ds_accordion_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color
      }
    },
    ds_accordion_radius: aliasToken.borderRadius.ds_alias_static_radius_8,
    ds_accordion_border_weight: aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_accordion_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    },
    ds_accordion_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_30
  }
}
