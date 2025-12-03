import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../config/index'
import {
  icon_button as icon_buttonTheme,
  table as tableTheme
} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  // eslint-disable-next-line
  const icon_button = icon_buttonTheme('dark')
  const table = tableTheme('dark')
  return createUseStyles({
    iconContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    smallIcon: {
      fontSize: `${icon_button.ds_icon_button_small_icon_size}px`,
      width: `${icon_button.ds_icon_button_small_icon_size}px`,
      height: `${icon_button.ds_icon_button_small_icon_size}px`
    },
    mediumIcon: {
      fontSize: `${icon_button.ds_icon_button_medium_icon_size}px`,
      width: `${icon_button.ds_icon_button_medium_icon_size}px`,
      height: `${icon_button.ds_icon_button_medium_icon_size}px`
    },
    largeIcon: {
      fontSize: `${icon_button.ds_icon_button_large_icon_size}px`,
      width: `${icon_button.ds_icon_button_large_icon_size}px`,
      height: `${icon_button.ds_icon_button_large_icon_size}px`
    },
    primaryState: {
      '& .icon:before': {
        color: `${table.table.table_cell.ds_table_cell_default_icon_color}`
      }
    },
    successState: {
      '& .icon:before': {
        color: `${table.table.table_title.ds_table_title_success_icon_color}`
      }
    },
    errorState: {
      '& .icon:before': {
        color: `${table.table.table_title.ds_table_title_error_icon_color}`
      }
    },
    disabledState: {
      pointerEvent: 'none',
      '& .icon:before': {
        color: `${aliasTokens.cta_disabled_primary_background_color}`
      }
    }
  })
}
