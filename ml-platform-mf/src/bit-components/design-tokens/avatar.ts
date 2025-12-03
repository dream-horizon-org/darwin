import aliasTokenDarkTheme from './aliasTokenDarkTheme'
import aliasTokenLightTheme from './aliasTokenLightTheme'
export const avatar = (theme) => {
  const aliasToken =
    theme === 'light' ? aliasTokenLightTheme : aliasTokenDarkTheme
  return {
    ds_player_image_large_size: aliasToken.sizing.ds_alias_static_size_48,
    ds_player_image_medium_size: aliasToken.sizing.ds_alias_static_size_40,
    ds_player_image_small_size: aliasToken.sizing.ds_alias_static_size_32,
    ds_player_image_extra_small_size: aliasToken.sizing.ds_alias_static_size_24,
    ds_player_image_mini_size: aliasToken.sizing.ds_alias_static_size_20,
    ds_team_image_large_size: aliasToken.sizing.ds_alias_static_size_48,
    ds_team_image_medium_size: aliasToken.sizing.ds_alias_static_size_40,
    ds_team_image_small_size: aliasToken.sizing.ds_alias_static_size_32,
    ds_team_image_extra_small_size: aliasToken.sizing.ds_alias_static_size_24
  }
}
