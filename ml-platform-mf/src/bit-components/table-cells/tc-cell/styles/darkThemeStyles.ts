import {createUseStyles} from 'react-jss'
import {
  divider as dividerTheme,
  table as tableTheme
} from '../../../design-tokens/index'
const divider = dividerTheme('dark')
const table = tableTheme('dark')

const darkThemeStyles = createUseStyles({
  tcCells: {
    '&.center': {
      minWidth: '200px',
      '&.MuiTableCell-root.MuiTableCell-root': {
        textAlign: 'center'
      }
    },
    '&.left': {
      minWidth: '200px',
      '&.MuiTableCell-root.MuiTableCell-root': {
        textAlign: 'left'
      }
    },
    '&.right': {
      minWidth: '200px',
      alignItems: 'flex-end',
      '&.MuiTableCell-root.MuiTableCell-root': {
        textAlign: 'right'
      }
    },
    '&.noMinWidth': {
      minWidth: 'unset'
    },
    boxSizing: 'border-box',
    borderBottom: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_solid}  ${divider.divider.ds_divider_border_generic_color}`,
    '&.large': {
      height: table.ds_table_cell_container_large_height
    },
    '&.medium': {
      height: table.ds_table_cell_container_medium_height
    },
    '&.small': {
      height: table.ds_table_cell_container_small_height
    },
    '&.header': {
      height: table.ds_table_title_container_height,
      background:
        table.table.table_title.ds_table_title_container_background_color
    },
    '&.parentHeader': {
      height: table.ds_table_title_container_height,
      background:
        table.table.table_title.ds_table_title_container_background_color,
      borderBottom: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_solid} #4D4D4D`
    }
  },
  container: {
    width: 'max-content',
    '&.left': {
      marginRight: 'auto'
    },
    '&.right': {
      marginLeft: 'auto'
    },
    '&.center': {
      margin: 'auto'
    }
  },
  loadingContainer: {
    width: '100%',
    '&.left': {
      marginRight: 'auto'
    },
    '&.right': {
      marginLeft: 'auto'
    },
    '&.center': {
      margin: 'auto'
    }
  },
  stickyLeftTableCell: {
    position: 'sticky',
    left: 0,
    boxShadow: '5px 0 5px -4px rgba(0, 0, 0, 0.3)',
    zIndex: 2,
    background:
      table.table.table_cell.ds_table_cell_container_default_background_color
  },
  stickyRightTableCell: {
    position: 'sticky',
    right: 0,
    boxShadow: '-6px 0 5px -5px rgba(0, 0, 0, 0.3)',
    zIndex: 2,
    background:
      table.table.table_cell.ds_table_cell_container_default_background_color
  }
})

export default darkThemeStyles

export const tableCellDarkThemeStyle = {
  '&.MuiTableCell-root': {
    padding: `0px ${table.ds_table_cell_large_horizontal_spacing}px`,
    verticalAlign: 'middle'
  }
}
