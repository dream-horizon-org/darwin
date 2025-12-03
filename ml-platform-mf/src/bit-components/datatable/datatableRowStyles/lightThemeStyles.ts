import {createUseStyles} from 'react-jss'
import {table as tableTheme} from '../../design-tokens/index'
import {hexToRGB} from '../utils'
const table = tableTheme('light')

export const dataTableRowLightTheme = {
  background:
    table.table.table_cell.ds_table_cell_container_default_background_color,
  '&:hover': {
    background: hexToRGB(
      table.table.table_cell.ds_table_cell_container_hover_background_color,
      table.ds_table_cell_container_hover_background_opacity
    )
  },
  '&:active': {
    backgroundColor: hexToRGB(
      table.table.table_cell.ds_table_cell_container_active_background_color,
      table.ds_table_cell_container_active_background_opacity
    )
  }
}

const datatableRowLightThemeStyles = createUseStyles({
  tableRowSelected: {
    background: hexToRGB(
      table.table.table_cell.ds_table_cell_container_active_background_color,
      table.ds_table_cell_container_active_background_opacity
    )
  },
  highlightedRow: {
    background:
      table.table.table_cell.ds_table_cell_container_success_background_color
  }
})

export default datatableRowLightThemeStyles
