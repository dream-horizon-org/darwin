import {table as tableTheme} from '../../design-tokens/index'
const table = tableTheme('light')

export const headerRowLightThemeStyle = {
  '&.MuiTableHead-root': {
    background:
      table.table.table_title.ds_table_title_container_background_color
  }
}
