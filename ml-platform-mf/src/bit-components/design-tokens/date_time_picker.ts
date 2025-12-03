import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const date_time_picker = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    date_time_picker: {
      background: {
        ds_date_time_picker_background_color:
          aliasToken.background.surface
            .ds_alias_surface_secondary_background_color,
        ds_date_time_picker_selctor_default_background_color:
          aliasToken.background.surface
            .ds_alias_surface_tertiary_background_color,
        ds_date_time_picker_selctor_hover_background_color:
          aliasToken.background.cta_secondary
            .ds_alias_cta_secondary_hover2_background_color,
        ds_date_time_picker_selctor_active_background_color:
          aliasToken.background.cta_primary
            .ds_alias_cta_primary_active_background_color
      },
      text: {
        ds_date_time_picker_default_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color,
        ds_date_time_picker_selecter_default_text_color:
          aliasToken.text.cta_secondary
            .ds_alias_cta_secondary_default1_text_color
      },
      icon: {
        ds_date_time_picker_deafult_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_default1_icon_color,
        ds_date_time_picker_disabled_icon_color:
          aliasToken.icon.cta_secondary
            .ds_alias_cta_secondary_disabled_icon_color
      }
    }
  }
}
