import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const timeline = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    timeline: {
      text: {
        ds_timeline_title_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_timeline_subtext_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default2_text_color
      },
      icon: {
        ds_timeline_success_icon_color:
          aliasToken.icon.accent.ds_alias_success_icon_color,
        ds_timeline_error_icon_color:
          aliasToken.icon.accent.ds_alias_error_icon_color,
        ds_timeline_warning_icon_color:
          aliasToken.icon.accent.ds_alias_warning_icon_color,
        ds_timeline_info_icon_color:
          aliasToken.icon.accent.ds_alias_information_icon_color,
        ds_timeline_draft_icon_color:
          aliasToken.icon.accent.ds_alias_default_icon_color
      }
    }
  }
}
