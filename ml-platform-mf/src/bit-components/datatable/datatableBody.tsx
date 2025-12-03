import {TableRow} from '@mui/material'
import TableBody from '@mui/material/TableBody'
import React from 'react'
import {TableCellSize} from '../table-cells/tc-cell/index'
import {TcShellLoading} from '../table-cells/tc-shell-loading/index'
import {ColumnConfig} from './datatable.type'
import DatatableRow from './datatableRow'

export type DataTableBodyProps<T, K> = {
  size: TableCellSize
  data: Array<T>
  columnConfig: Array<ColumnConfig<T>>
  selectedRow: number[]
  setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>
  onRequestSort?: (id: unknown, columnName: string, order: string) => void
  orderBy?: string
  order?: 'asc' | 'desc'
  enableSelection?: boolean
  enableSelectionColumn?: boolean
  indexKeyName: string
  singleSelection?: boolean
  disableItems?: Array<number>
  defaultSelection?: number | Array<number>
  childColumnConfig?: Array<ColumnConfig<K>>
  enableChildTable?: boolean
  childTableKey?: string
  onRowClick?: (row: T) => void
  lastRow: React.RefObject<HTMLTableRowElement>
  onIconListElementClick?: (event, rowIndex, elementIndex) => void
  onIconButtonClick?: (event, index) => void
  loading?: boolean
  infiniteScrollLoader?: boolean
  rowsPerPage: {label: string; id: number}
  theme?: string
  lastEditedRowKey?: string | null | undefined
  lastEditedRowKeyValue?: string | number | boolean | null | undefined
}

export default function DataTableBody<T, K>(props: DataTableBodyProps<T, K>) {
  const {
    data,
    columnConfig,
    defaultSelection,
    size,
    enableSelection,
    enableSelectionColumn,
    setSelectedRow,
    disableItems,
    singleSelection,
    indexKeyName,
    selectedRow,
    childColumnConfig,
    enableChildTable,
    childTableKey,
    onRowClick,
    lastRow,
    onIconListElementClick,
    onIconButtonClick,
    loading,
    infiniteScrollLoader,
    rowsPerPage,
    theme,
    lastEditedRowKeyValue,
    lastEditedRowKey
  } = props

  return (
    <TableBody>
      {(loading ? new Array(+rowsPerPage.label).fill(0) : data)?.map(
        (row, index) => {
          return (
            <DatatableRow<T, K>
              loading={loading}
              enableChildTable={enableChildTable}
              childColumnConfig={childColumnConfig}
              size={size}
              enableSelection={enableSelection}
              enableSelectionColumn={enableSelectionColumn}
              defaultSelection={defaultSelection}
              row={row}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              disableItems={disableItems}
              key={index}
              childTableKey={childTableKey}
              singleSelection={singleSelection}
              indexKeyName={indexKeyName}
              columnConfig={columnConfig}
              onRowClick={onRowClick}
              theme={theme}
              onIconListElementClick={(event, elementIndex) => {
                if (onIconListElementClick) {
                  onIconListElementClick(event, index, elementIndex)
                }
              }}
              onIconButtonClick={(event) => {
                if (onIconButtonClick) {
                  onIconButtonClick(event, index)
                }
              }}
              innerRef={index === data.length - 1 ? lastRow : null}
              lastEditedRowKey={lastEditedRowKey}
              lastEditedRowKeyValue={lastEditedRowKeyValue}
            />
          )
        }
      )}
      {infiniteScrollLoader &&
        new Array(+rowsPerPage.label).fill(0).map((_, index) => {
          return (
            <TableRow key={index}>
              {columnConfig?.map((column) => {
                return (
                  <TcShellLoading
                    theme={theme}
                    loading={infiniteScrollLoader}
                    size={size}
                    key={column?.id}
                    testIdentifier='shell-loading'
                  />
                )
              })}
            </TableRow>
          )
        })}
    </TableBody>
  )
}
