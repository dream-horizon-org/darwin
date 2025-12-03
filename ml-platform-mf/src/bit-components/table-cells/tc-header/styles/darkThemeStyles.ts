import {createUseStyles} from 'react-jss'
import {
  divider as dividerTheme,
  icon_button as icon_buttonTheme,
  table as tableTheme
} from '../../../design-tokens/index'

const table = tableTheme('dark')
const divider = dividerTheme('dark')
// eslint-disable-next-line @typescript-eslint/naming-convention
const icon_button = icon_buttonTheme('dark')
const darkThemeStyles = createUseStyles({
  tcHeader: {
    borderBottom: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_solid}  ${divider.divider.ds_divider_border_generic_color}`,
    height: table.ds_table_title_container_height,
    background:
      table.table.table_title.ds_table_title_container_background_color,
    whiteSpace: 'nowrap'
  },
  tcParentHeader: {
    borderBottom: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_solid}  #4d4d4d`
  },
  tcChildHeader: {
    top: `${
      table.ds_table_title_container_height +
      divider.ds_divider_horizontal_border_weight
    }px`
  },
  stickyLeftTableHeader: {
    position: 'sticky',
    left: 0,
    boxShadow: '5px 0 5px -4px rgba(0, 0, 0, 0.3)',
    zIndex: 3
  },
  tcHeaderTag: {
    height: 'unset',
    display: 'flex !important',
    alignItems: 'center',
    gap: table.ds_table_cell_large_vertical_spacing
  },
  stickyRightTableHeader: {
    position: 'sticky',
    right: 0,
    boxShadow: '-6px 0 5px -5px rgba(0, 0, 0, 0.3)',
    zIndex: 3
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    width: '16px',
    height: '16px',
    '&:before': {
      color: table.table.table_title.ds_table_title_default_text_color
    },
    '&.trailing': {
      marginLeft: '8px',
      '&::before': {
        color:
          icon_button.icon_button.primary.icon
            .ds_icon_button_primary_default_icon_color
      }
    }
  },
  trailingToolTip: {
    display: 'flex',
    alignItems: 'center'
  },
  headerText: {
    fontWeight: 'bold'
  }
})

export default darkThemeStyles

export const tableCellDarkThemeStyle = {
  '&.MuiTableCell-root': {
    padding: `0px ${table.ds_table_cell_large_horizontal_spacing}px`,
    verticalAlign: 'middle'
  }
}
