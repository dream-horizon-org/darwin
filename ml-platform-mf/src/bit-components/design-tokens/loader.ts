import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const loader = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    loader: {
      loader_line: {
        border: {
          ds_loader_line_base_border_color:
            aliasToken.border.surface.ds_alias_surface2_border_color,
          ds_loader_line_active_border_color:
            aliasToken.border.surface.ds_alias_surface1_border_color
        }
      },
      loader_circle: {
        border: {
          ds_loader_circle_base_border_color:
            aliasToken.border.surface.ds_alias_surface2_border_color,
          ds_loader_circle_active_border_color:
            aliasToken.border.surface.ds_alias_surface1_border_color
        }
      }
    },
    ds_loader_line_border_radius:
      aliasToken.borderRadius.ds_alias_static_radius_0,
    ds_loader_line_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_4,
    ds_loader_circle_border_weight:
      aliasToken.borderWidth.ds_alias_static_border_4,
    ds_loader_circle_large_size: aliasToken.sizing.ds_alias_static_size_48,
    ds_loader_circle_medium_size: aliasToken.sizing.ds_alias_static_size_32,
    ds_loader_circle_small_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_loader_circle_xxsmall_size: aliasToken.sizing.ds_alias_static_size_16
  }
}
