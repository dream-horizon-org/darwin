import TableRow from '@mui/material/TableRow'
import React, {useState} from 'react'
import {Icons} from '../icon/index'
import {TableCellSize} from '../table-cells/tc-cell/index'
import {TcIcon} from '../table-cells/tc-icon/index'
import {TcSelect} from '../table-cells/tc-select/index'
import {TcShellLoading} from '../table-cells/tc-shell-loading/index'
import {SortOrder} from './constants'
import {TableCell} from './datatable.config'
import {ColumnConfig} from './datatable.type'
import DatatableChildBody from './datatableChildBody'
import datatableRowDarkThemeStyles, {
  dataTableRowDarkTheme
} from './datatableRowStyles/darkThemeStyles'
import datatableRowLightThemeStyles, {
  dataTableRowLightTheme
} from './datatableRowStyles/lightThemeStyles'
import {isLastEdited, isSelected} from './utils'
export type DataTableRowProps<T, K> = {
  size: TableCellSize
  row: T
  columnConfig: Array<ColumnConfig<T>>
  allRowSelected?: boolean
  disableSelected?: boolean
  selectedRow: number[]
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>
  onRequestSort?: (id: unknown, columnName: string, order: string) => void
  orderBy?: string
  order?: SortOrder
  enableSelection?: boolean
  enableSelectionColumn?: boolean
  indexKeyName: string
  singleSelection?: boolean
  defaultSelection?: number | Array<number>
  disableItems?: Array<number>
  childColumnConfig?: Array<ColumnConfig<K>>
  enableChildTable?: boolean
  childTableKey?: string
  onRowClick?: (row: T) => void
  innerRef: React.RefObject<HTMLTableRowElement> | null
  onIconListElementClick?: (event, elementIndex) => void
  onIconButtonClick?: (event) => void
  loading?: boolean
  theme?: string
  lastEditedRowKey?: string | null | undefined
  lastEditedRowKeyValue?: string | number | boolean | null | undefined
}

export default function DatatableRow<T, K>(props: DataTableRowProps<T, K>) {
  const {
    columnConfig,
    row,
    size,
    enableSelection,
    indexKeyName,
    setSelectedRow,
    selectedRow,
    singleSelection,
    disableSelected,
    disableItems,
    defaultSelection,
    allRowSelected,
    childColumnConfig,
    enableChildTable,
    childTableKey,
    enableSelectionColumn,
    onRowClick,
    innerRef,
    onIconListElementClick,
    onIconButtonClick,
    loading,
    theme,
    lastEditedRowKeyValue,
    lastEditedRowKey
  } = props
  const enableSelections = enableSelection ? enableSelection : false
  const defaultSelections = defaultSelection ? defaultSelection : []
  const isSelectedRow = isSelected(
    row[indexKeyName],
    enableSelections,
    defaultSelections,
    selectedRow
  )
  const isLastEditedRow = isLastEdited(
    row,
    lastEditedRowKey,
    lastEditedRowKeyValue
  )
  const [expandRow, setExpandRow] = useState<boolean>(false)
  const classes =
    theme === 'dark'
      ? datatableRowDarkThemeStyles()
      : theme === 'light'
      ? datatableRowLightThemeStyles()
      : datatableRowDarkThemeStyles()
  const onRowClicks = onRowClick ? onRowClick : () => {}
  return (
    <>
      <TableRow
        sx={
          theme === 'dark'
            ? dataTableRowDarkTheme
            : theme === 'light'
            ? dataTableRowLightTheme
            : dataTableRowDarkTheme
        }
        className={`${isSelectedRow ? classes.tableRowSelected : ''} ${
          isLastEditedRow ? classes.highlightedRow : ''
        }`}
        onClick={() => onRowClicks(row)}
        ref={innerRef}
      >
        {enableSelectionColumn &&
          (loading ? (
            <TcShellLoading
              theme={theme}
              loading={loading}
              size={size}
              testIdentifier='shell-loading'
            />
          ) : (
            <TcSelect<T>
              theme={theme}
              disableItems={disableItems}
              defaultSelection={defaultSelection}
              allRowSelected={allRowSelected}
              disableSelected={disableSelected}
              enableSelection={enableSelection}
              indexKeyName={indexKeyName}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              row={row}
              singleSelection={singleSelection}
            />
          ))}
        {columnConfig?.map((column, index) => {
          return loading ? (
            <TcShellLoading
              theme={theme}
              loading={loading}
              size={size}
              key={index}
              testIdentifier='shell-loading'
            />
          ) : (
            <TableCell
              theme={theme}
              key={index}
              tableCell={column.columnType}
              size={size}
              componentProps={column.componentProps(row)}
              onIconListElementClick={onIconListElementClick}
              onIconButtonClick={onIconButtonClick}
            />
          )
        })}
        {enableChildTable && !loading && (
          <TcIcon
            theme={theme}
            leadingIcon={
              expandRow
                ? Icons.ICON_KEYBOARD_ARROW_UP
                : Icons.ICON_KEYBOARD_ARROW_DOWN
            }
            onClick={() => {
              setExpandRow(!expandRow)
            }}
          />
        )}
      </TableRow>
      {childColumnConfig && enableChildTable && expandRow && (
        <DatatableChildBody<T, K>
          theme={theme}
          expandRow={expandRow}
          columnConfig={columnConfig}
          row={row}
          indexKeyName={indexKeyName}
          childTableKey={childTableKey}
          childColumnConfig={childColumnConfig}
          enableSelection={enableSelection}
        />
      )}
    </>
  )
}
