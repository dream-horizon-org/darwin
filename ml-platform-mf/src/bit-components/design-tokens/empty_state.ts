import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const empty_state = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    empty_state: {
      text: {
        ds_empty_title_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color,
        ds_empty_subbtext_text_color:
          aliasToken.text.onsurface.ds_alias_onsurface_default1_text_color
      }
    }
  }
}
