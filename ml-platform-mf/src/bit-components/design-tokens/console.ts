import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const console = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_console_min_width: aliasToken.sizing.ds_alias_static_size_292,
    ds_console_min_height: aliasToken.sizing.ds_alias_static_size_122,
    ds_console_container_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_console_container_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_console_action_header_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_console_action_header_right_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_console_radius: aliasToken.borderRadius.ds_alias_static_radius_8,
    console: {
      border: {
        ds_console_border_color:
          aliasToken.border.surface.ds_alias_surface2_border_color
      },
      background: {
        ds_console_border_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color
      }
    },
    ds_console_border_style:
      aliasToken.border.style.ds_alias_static_border_style_solid,
    ds_console_border_width: aliasToken.borderWidth.ds_alias_static_border_1
  }
}
