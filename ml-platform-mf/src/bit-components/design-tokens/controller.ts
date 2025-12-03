import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const controller = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_controller_container_width: aliasToken.sizing.ds_alias_static_size_56,
    ds_controller_action_icon_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_controller_action_icon_internal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_controller_action_icon_label_top_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_controller_action_icon_vertical_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_16,
    ds_controller_bottom_icons_vertical_inline_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_controller_vertical_spacing: aliasToken.spacing.ds_alias_static_space_16,
    ds_controller_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    controller: {
      background: {
        ds_controller_background_color:
          aliasToken.background.surface
            .ds_alias_surface_primary_background_color,
        ds_controller_action_icon_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover1_background_color,
        ds_controller_action_icon_clicked_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_clicked_background_color
      },
      border: {
        ds_controller_action_icon_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_default2_border_color,
        ds_controller_disable_icon_border_color:
          aliasToken.border.cta_secondary
            .ds_alias_cta_secondary_disable_border_color
      },
      icon: {
        ds_controller_action_icon_default_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default3_icon_color,
        ds_controller_action_icon_hover_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_hover1_icon_color,
        ds_controller_action_icon_clicked_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_hover1_icon_color,
        ds_controller_action_icon_disable_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color
      },
      text: {
        ds_controller_action_icon_lable_default_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_controller_action_icon_lable_hover_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_controller_action_icon_lable_clicked_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_controller_action_icon_lable_disable_color:
          aliasToken.text.onsurface.ds_alias_onsurface_disabled_text_color
      }
    },
    ds_controller_action_icon_border_width:
      aliasToken.borderWidth.ds_alias_static_border_1,
    ds_controller_action_icon_border_opacity:
      aliasToken.opacity.ds_alias_static_opacity_25,
    border_style: {
      ds_controller_action_icon_border_style:
        aliasToken.border.style.ds_alias_static_border_style_solid
    }
  }
}
