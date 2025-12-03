import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

export const tableComponentTokens = {
  table_row_hover_background_color: aliasTokens.hover_primary_color,
  table_row_hover_border_color: aliasTokens.hover_primary_color,
  table_row_selected_background_color: aliasTokens.hover_list_color,
  table_row_selected_border_color: aliasTokens.hover_primary_color,
  table_header_text_color: aliasTokens.primary_text_color,
  text_color: aliasTokens.primary_text_color,
  default_row_background_color: aliasTokens.secondary_background_color,
  default_border_color: aliasTokens.inactive_border_color,
  table_header_color: aliasTokens.tertiary_background_color,
  seperator_background_color: aliasTokens.information_background_color,
  pagination_text_color: aliasTokens.base_text_color,
  disabled_text_color: aliasTokens.disabled_text_color,
  active_background_color: aliasTokens.success_background_color,
  inactive_background_color: aliasTokens.error_background_color,
  sort_label_icon_color: aliasTokens.base_text_color,
  table_selected_background_color: aliasTokens.purple_background_color
}
export const styles = createStyles({
  loaderContainer: {
    display: 'flex',
    padding: '12px 12px 12px 12px',
    height: '680px'
  },
  loader: {
    margin: 'auto'
  },
  tableContainer: {
    overflowX: 'auto',
    maxHeight: 'calc(100vh - 280px)'
  },
  columnWrap: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: tableComponentTokens.table_header_text_color
  },
  rowSpanCell: {
    paddingBottom: 0,
    borderBottom: 0,
    paddingLeft: 56
  },
  rowHover: {
    backgroundColor: tableComponentTokens.table_row_hover_background_color
  },
  headerCell: {
    color: tableComponentTokens.table_header_text_color,
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  dataCell: {
    whiteSpace: 'nowrap'
  },
  tableRow: {
    height: 28
  },
  rotate: {
    transition: 'all 0.1s linear',
    transform: 'rotate(180deg)'
  },
  reverse: {
    transition: 'all 0.1s linear',
    transform: 'rotate(0deg)'
  },
  rowSelected: {
    background: tableComponentTokens.table_row_selected_background_color,
    border: 'none'
  },
  rowHighlighted: {
    background: tableComponentTokens.table_selected_background_color
  },
  rowWithBoxShadow: {
    boxShadow: `inset 0 0 5px ${aliasTokens.table_popin_color}`
  },
  dataCellDisabled: {
    background: tableComponentTokens.default_row_background_color
  },
  disabled: {
    background: `#fffaf0`
  },
  noShadow: {
    boxShadow: 'none'
  },
  tableHeaderCell: {
    padding: '8px 24px 8px 24px'
  },
  tableHeaderCellBold: {
    fontWeight: 700,
    height: 72,
    background: tableComponentTokens.table_header_color
  },
  tableDataCell: {
    padding: '16px 24px 16px 24px',
    lineHeight: '1.65'
  },
  tableRowWithGrayBg: {
    height: 56
  },
  tableRowMediumHeight: {
    height: 40
  },
  tableRowMaxHeight: {
    height: 64
  },
  tableRowHeight72: {
    height: 72
  },
  // Overriding the material ui stylings of the selected table row
  tableRowSelColor: {},
  tableRowSelHover: {},
  // Overriding the material ui stylings of the table cell with checkbox
  tableCellCheckboxPadding: {
    padding: '15px'
  },
  stickyLeftTableHeader: {
    position: 'sticky',
    left: 0,
    boxShadow: '5px 0 5px -4px rgba(0, 0, 0, 0.3)',
    zIndex: 3
  },
  stickyRightTableHeader: {
    position: 'sticky',
    right: 0,
    boxShadow: '-6px 0 5px -5px rgba(0, 0, 0, 0.3)',
    zIndex: 3
  },
  stickyLeftTableCell: {
    position: 'sticky',
    left: 0,
    boxShadow: '5px 0 5px -4px rgba(0, 0, 0, 0.3)',
    zIndex: 2,
    background: tableComponentTokens.default_row_background_color
  },
  stickyRightTableCell: {
    position: 'sticky',
    right: 0,
    boxShadow: '-6px 0 5px -5px rgba(0, 0, 0, 0.3)',
    zIndex: 2,
    background: tableComponentTokens.default_row_background_color
  },
  separator: {
    height: 35,
    margin: '8px 0 8px',
    padding: '0 0 1px 1px',
    background: aliasTokens.tertiary_background_color
  },
  separatorText: {
    display: 'flex',
    justifyContent: 'center'
  },
  backButtonClass: {
    '&:disabled': {
      opacity: 0.5
    }
  },
  tableCell: {
    padding: 0
  },
  datalistContainer: {
    zIndex: 0
  },
  headerCell2Rows: {
    padding: '4px 24px',
    color: tableComponentTokens.table_header_text_color,
    fontSize: 14,
    whiteSpace: 'nowrap'
  }
})
