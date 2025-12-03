import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const actionable_icon_button = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    actionable_icon_button: {
      primary: {
        icon: {
          ds_actionable_icon_primary_default_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_primary_hover_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_primary_clicked_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_primary_active_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_primary_active_hover_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_primary_disable_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        },
        background: {
          ds_actionable_icon_primary_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color,
          ds_actionable_icon_primary_clicked_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_clicked_background_color,
          ds_actionable_icon_primary_active_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_active_background_color,
          ds_actionable_icon_primary_active_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color
        }
      },
      secondary: {
        icon: {
          ds_actionable_icon_secondary_default_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_default2_icon_color,
          ds_actionable_icon_secondary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_default2_icon_color,
          ds_actionable_icon_secondary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_default2_icon_color,
          ds_actionable_icon_secondary_active_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_secondary_active_hover_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_secondary_disable_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        },
        background: {
          ds_actionable_icon_secondary_hover_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_hover1_background_color,
          ds_actionable_icon_secondary_clicked_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_clicked_background_color,
          ds_actionable_icon_secondary_active_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_active_background_color,
          ds_actionable_icon_secondary_active_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color
        }
      },
      tertiary: {
        icon: {
          ds_actionable_icon_tertiary_default_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_default3_icon_color,
          ds_actionable_icon_tertiary_hover_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_default3_icon_color,
          ds_actionable_icon_tertiary_clicked_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_default3_icon_color,
          ds_actionable_icon_tertiary_active_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_tertiary_active_hover_icon_color:
            aliasToken.icon.cta_primary.ds_alias_cta_primary_default_icon_color,
          ds_actionable_icon_tertiary_disable_icon_color:
            aliasToken.icon.cta_secondary
              .ds_alias_cta_secondary_disabled_icon_color
        },
        background: {
          ds_actionable_icon_tertiary_hover_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_hover1_background_color,
          ds_actionable_icon_tertiary_clicked_background_color:
            aliasToken.background.cta_secondary
              .ds_alias_cta_secondary_clicked_background_color,
          ds_actionable_icon_tertiary_active_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_active_background_color,
          ds_actionable_icon_tertiary_active_hover_background_color:
            aliasToken.background.cta_primary
              .ds_alias_cta_primary_hover_background_color
        }
      }
    },
    ds_actionable_icon_large_spacing:
      aliasToken.spacing.ds_alias_static_space_8,
    ds_actionable_icon_medium_spacing:
      aliasToken.spacing.ds_alias_static_space_6,
    ds_actionable_icon_small_spacing:
      aliasToken.spacing.ds_alias_static_space_4,
    ds_actionable_icon_extra_small_spacing:
      aliasToken.spacing.ds_alias_static_space_2,
    ds_actionable_icon_large_icon_size:
      aliasToken.sizing.ds_alias_static_size_24,
    ds_actionable_icon_medium_icon_size:
      aliasToken.sizing.ds_alias_static_size_20,
    ds_actionable_icon_small_icon_size:
      aliasToken.sizing.ds_alias_static_size_16,
    ds_actionable_icon_extra_small_icon_size:
      aliasToken.sizing.ds_alias_static_size_12,
    ds_actionable_icon_radius:
      aliasToken.borderRadius.ds_alias_static_radius_pill,
    ds_actionable_icon_primary_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_20,
    ds_actionable_icon_primary_clicked_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_30,
    ds_actionable_icon_primary_active_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_20,
    ds_actionable_icon_primary_active_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_45,
    ds_actionable_icon_secondary_clicked_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_50,
    ds_actionable_icon_secondary_active_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_20,
    ds_actionable_icon_secondary_active_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_45,
    ds_actionable_icon_tertiary_clicked_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_50,
    ds_actionable_icon_tertiary_active_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_20,
    ds_actionable_icon_tertiary_active_hover_background_opacity:
      aliasToken.opacity.ds_alias_static_opacity_45
  }
}
