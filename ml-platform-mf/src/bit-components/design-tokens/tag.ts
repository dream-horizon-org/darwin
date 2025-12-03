import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const tag = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    tag: {
      generic: {
        default: {
          ds_tag_generic_default_background_color:
            aliasToken.background.generic.ds_alias_default_background_color,
          ds_tag_generic_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
          ds_tag_generic_icon_color:
            aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
        },
        success: {
          ds_tag_generic_success_background_color:
            aliasToken.background.generic.ds_alias_success_background_color,
          ds_tag_generic_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
          ds_tag_generic_icon_color:
            aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
        },
        information: {
          ds_tag_generic_information_background_color:
            aliasToken.background.generic.ds_alias_information_background_color,
          ds_tag_generic_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
          ds_tag_generic_icon_color:
            aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
        },
        error: {
          ds_tag_generic_error_background_color:
            aliasToken.background.generic.ds_alias_error_background_color,
          ds_tag_generic_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
          ds_tag_generic_icon_color:
            aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
        },
        warning: {
          ds_tag_generic_warning_background_color:
            aliasToken.background.generic.ds_alias_warning_background_color,
          ds_tag_generic_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
          ds_tag_generic_icon_color:
            aliasToken.icon.onsurface.ds_alias_surface_primary_icon_color
        }
      },
      status: {
        text: {
          ds_tag_status_default_text_color:
            aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
        },
        icon: {
          ds_tag_status_default_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_hover2_icon_color,
          ds_tag_status_success_icon_color:
            aliasToken.icon.accent.ds_alias_success_icon_color,
          ds_tag_status_information_icon_color:
            aliasToken.icon.accent.ds_alias_information_icon_color,
          ds_tag_status_error_icon_color:
            aliasToken.icon.accent.ds_alias_error_icon_color,
          ds_tag_status_warning_icon_color:
            aliasToken.icon.accent.ds_alias_warning_icon_color
        }
      },
      counter: {
        default: {
          ds_tag_counter_default_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default2_text_color,
          ds_tag_counter_default_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_default2_background_color
        },
        active: {
          ds_tag_counter_active_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_default1_text_color,
          ds_tag_counter_active_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_active_background_color
        },
        disable: {
          ds_tag_counter_disable_text_color:
            aliasToken.text.cta_secondary
              .ds_alias_cta_secondary_disable_text_color,
          ds_tag_counter_disable_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_disable_background_color
        }
      }
    },
    ds_tag_generic_icon_medium_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_tag_generic_icon_small_size: aliasToken.sizing.ds_alias_static_size_16,
    ds_tag_generic_icon_xsmall_size: aliasToken.sizing.ds_alias_static_size_12,
    ds_tag_status_icon_size: aliasToken.sizing.ds_alias_static_size_16,
    ds_tag_generic_small_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_tag_counter_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_tag_counter_vertical_spacing: aliasToken.spacing.ds_alias_static_space_2,
    ds_tag_generic_medium_horizontal_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_tag_generic_small_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_tag_generic_medium_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_tag_generic_small_with_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_tag_generic_medium_with_icon_vertical_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_tag_generic_small_with_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_tag_generic_medium_with_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_12,
    ds_tag_generic_small_with_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_tag_generic_icon_left_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_tag_status_icon_right_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_tag_generic_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_tag_counter_radius: aliasToken.borderRadius.ds_alias_static_radius_4,
    ds_tag_counter_active_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_30
  }
}
