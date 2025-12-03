import {createUseStyles} from 'react-jss'
import {table as tableTheme} from '../../design-tokens/index'

export const stylesLightTheme = () => {
  const table = tableTheme('light')
  return createUseStyles({
    timer_running: {
      color: table.table.table_title.ds_table_title_error_icon_color
    },

    timer_stopped: {
      color: table.table.table_title.ds_table_title_default_icon_color
    }
  })
}
