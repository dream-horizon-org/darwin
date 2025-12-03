import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const popout = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_popout_max_width: aliasToken.sizing.ds_alias_static_size_292,
    ds_popout_max_height: aliasToken.sizing.ds_alias_static_size_300,
    ds_popout_content_container_width:
      aliasToken.sizing.ds_alias_static_size_240,
    ds_popout_content_container_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_popout_content_container_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_popout_close_icon_top_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_popout_close_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_popout_chip_horizontal_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_popout_chip_vertical_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    popout: {
      background: {
        ds_popout_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color
      },
      border: {
        ds_popout_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color
      }
    },
    ds_popout_radius: aliasToken.borderRadius.ds_alias_static_radius_8,
    ds_popout_border_width: aliasToken.borderWidth.ds_alias_static_border_1,
    ds_popout_background_opacity: aliasToken.opacity.ds_alias_static_opacity_50,
    ds_popout_shadow: '0px 4px 10px 0px #00000025',
    blur: {
      ds_popout_background_blur: aliasToken.blur.ds_alias_static_blur_24
    }
  }
}
