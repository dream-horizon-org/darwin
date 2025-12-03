import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import React from 'react'
import {Checkbox} from '../checkbox/index'
import {
  TableCellSize,
  TableCellType,
  TcCell
} from '../table-cells/tc-cell/index'
import {TcHeader} from '../table-cells/tc-header/index'
import {SortOrder} from './constants'
import {ColumnConfig} from './datatable.type'
import {headerRowDarkThemeStyle} from './datatableHeaderStyles/darkThemeStyles'
import {headerRowLightThemeStyle} from './datatableHeaderStyles/lightThemeStyles'
import {handleSelectAll} from './utils'

export type DataTableHeaderProps<T> = {
  singleSelection?: boolean
  onSelectAllClick?: (params: any) => void
  defaultSelection?: number | Array<number>
  indexKeyName: string
  disableItems?: Array<number>
  size?: TableCellSize
  enableSelectionColumn?: boolean
  data: Array<T>
  columnConfig: Array<ColumnConfig<T>>
  allRowSelected?: boolean
  disableSelected?: boolean
  selectedRow: number[]
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>
  onRequestSort?: (id: unknown, columnName: string, order: string) => void
  orderBy?: (string | number)[] | string
  order?: SortOrder
  activeSortColId?: string | number
  enableChildTable?: boolean
  enableParentHeader?: boolean
  theme?: string
}
export default function DataTableHeader<T>(props: DataTableHeaderProps<T>) {
  const {
    columnConfig,
    defaultSelection,
    enableSelectionColumn,
    singleSelection,
    disableItems,
    indexKeyName,
    orderBy,
    order,
    activeSortColId,
    data,
    setSelectedRow,
    selectedRow,
    onRequestSort,
    enableChildTable,
    enableParentHeader,
    theme
  } = props
  const numSelected = selectedRow.length > 0
  const disableItem = disableItems ? disableItems : []
  const defaultSelections = defaultSelection ? defaultSelection : []
  return (
    <TableHead>
      {enableParentHeader && (
        <TableRow
          sx={
            theme === 'dark'
              ? headerRowDarkThemeStyle
              : theme === 'light'
              ? headerRowLightThemeStyle
              : headerRowDarkThemeStyle
          }
        >
          {enableSelectionColumn &&
            (singleSelection ? (
              <TcCell theme={theme} type={TableCellType.ParentHeader}></TcCell>
            ) : (
              <TcCell theme={theme} type={TableCellType.ParentHeader}>
                <Checkbox
                  theme={theme}
                  indeterminate={numSelected}
                  checked={numSelected}
                  onChange={(event) => {
                    handleSelectAll<T>(
                      event,
                      disableItem,
                      data,
                      indexKeyName,
                      setSelectedRow,
                      defaultSelections
                    )
                  }}
                />
              </TcCell>
            ))}
          {columnConfig.map((column, index) => {
            const parentHeader = column?.parentHeaderProps
            return parentHeader ? (
              <TcHeader
                theme={theme}
                headerProps={column?.parentHeaderProps}
                stickyPosition={column?.stickyPosition}
                orderBy={orderBy}
                order={order}
                activeSortColId={activeSortColId}
                onRequestSort={onRequestSort}
                key={index}
                isParentHeader={true}
              ></TcHeader>
            ) : null
          })}
          {enableChildTable && (
            <TcCell type={TableCellType.Header} theme={theme}></TcCell>
          )}
        </TableRow>
      )}
      <TableRow
        sx={
          theme === 'dark'
            ? headerRowDarkThemeStyle
            : theme === 'light'
            ? headerRowLightThemeStyle
            : headerRowDarkThemeStyle
        }
      >
        {enableSelectionColumn &&
          (singleSelection ? (
            <TcCell type={TableCellType.Header} theme={theme}></TcCell>
          ) : (
            <TcCell type={TableCellType.Header} theme={theme}>
              <Checkbox
                theme={theme}
                indeterminate={numSelected}
                checked={numSelected}
                onChange={(event) => {
                  handleSelectAll<T>(
                    event,
                    disableItem,
                    data,
                    indexKeyName,
                    setSelectedRow,
                    defaultSelections
                  )
                }}
              />
            </TcCell>
          ))}
        {columnConfig.map((column, index) => (
          <TcHeader
            theme={theme}
            orderBy={orderBy}
            activeSortColId={activeSortColId}
            headerProps={column?.headerProps}
            order={order}
            onRequestSort={onRequestSort}
            key={index}
            stickyPosition={column?.stickyPosition}
            isChildHeader={enableParentHeader}
          ></TcHeader>
        ))}
        {enableChildTable && (
          <TcCell theme={theme} type={TableCellType.Header}></TcCell>
        )}
      </TableRow>
    </TableHead>
  )
}
