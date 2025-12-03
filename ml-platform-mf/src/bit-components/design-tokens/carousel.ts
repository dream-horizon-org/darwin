import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const carousel = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_carousel_overlay_width: aliasToken.sizing.ds_alias_static_size_32,
    ds_carousel_navdot_size: aliasToken.sizing.ds_alias_static_size_8,
    ds_carousel_sidercard_overlay_width:
      aliasToken.sizing.ds_alias_static_size_32,
    ds_carousel_card_max_width: aliasToken.sizing.ds_alias_static_size_968,
    ds_carousel_navdot_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_carousel_left_slider_arrow_right_spacing:
      aliasToken.spacing.ds_alias_static_space_20,
    ds_carousel_right_slider_arrow_left_spacing:
      aliasToken.spacing.ds_alias_static_space_20,
    ds_carousel_card_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_24,
    ds_carousel_horizontal_spacing: aliasToken.spacing.ds_alias_static_space_24,
    ds_carousel_top_spacing: aliasToken.spacing.ds_alias_static_space_40,
    ds_carousel_bottom_spacing: aliasToken.spacing.ds_alias_static_space_24,
    ds_carousel_navdot_top_spacing: aliasToken.spacing.ds_alias_static_space_24,
    carousel: {
      background: {
        ds_carousel_left_overlay_background_color:
          aliasToken.background.surface
            .ds_alias_surface_gradient1_background_color,
        ds_carousel_right_overlay_background_color:
          aliasToken.background.surface
            .ds_alias_surface_gradient2_background_color,
        ds_carousel_navdot_default_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_default2_background_color,
        ds_carousel_navdot_active_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color
      },
      border: {
        ds_carousel_card_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color
      }
    },
    ds_carousel_card_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_carousel_card_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_1,
    border_style: {
      ds_carousel_card_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    }
  }
}
