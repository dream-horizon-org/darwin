import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import React, {useEffect, useRef, useState} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {TableCellSize} from '../table-cells/tc-cell/index'
import {SortOrder} from './constants'
import {
  defaultPageHandler,
  defaultPages,
  defaultRowPerPage,
  defaultRowPerPageValue,
  defaultrowsPerPageHandler,
  defaultTotalRow
} from './datatable.mockData'
import {ColumnConfig} from './datatable.type'
import DataTableBody from './datatableBody'
import DatatableFooter from './datatableFooter'
import DataTableHeader from './DataTableHeader'
import {
  paperContainerDarkThemeStyle,
  tableContainerDarkThemeStyle,
  tableRowDarkThemeStyles
} from './datatableStyles/darkThemeStyles'
import {
  paperContainerLightThemeStyle,
  tableContainerLightThemeStyle,
  tableRowLightThemeStyles
} from './datatableStyles/lightThemeStyles'
import {handleRadioSelect, handleSelect} from './utils'
export type DatatableProps<T, K> = {
  /**
   * To select size of table cell
   */
  size: TableCellSize
  /**
   * Send data to datatable
   */
  data: Array<T>
  /**
   * Column design of data table
   */
  columnConfig: Array<ColumnConfig<T>>
  /**
   * To enable the header
   */
  enableHeader?: boolean
  /**
   * To enable the single selection
   */
  singleSelection?: boolean
  /**
   * To enable the selection (this must be false for TcCheckbox column type in columnConfig)
   */
  enableSelection?: boolean
  /**
   * To enable checkbox column in table.
   */
  enableSelectionColumn?: boolean
  /**
   * To select single row
   */
  defaultSelection?: number | Array<number>
  /**
   * Property to select as index
   */
  indexKeyName: string
  /**
   * To disable the items in the row
   */
  disableItems?: Array<number>
  /**
   * On sort request handler
   */
  onRequestSort?: (id: unknown, columnName: string, order: string) => void
  /**
   * To sort which column
   */
  orderBy?: (string | number)[] | string
  /**
   * To sort by order
   */
  order?: SortOrder
  /**
   * active sorting column
   */
  activeSortColId?: string | number
  /**
   * On select all options
   */
  onSelectAllClick?: (params: any) => void
  /**
   * To set a number
   */
  totalRow?: number
  /**
   * To show a loader
   */
  loading?: boolean
  /**
   * To show a infinite scroll loader
   */
  infiniteScrollLoader?: boolean
  /**
   * To set the row per page
   */
  rowsPerPage?: {label: string; id: number}
  /**
   * Function to handle row per page
   */
  rowsPerPageHandler?: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: {label: string; id: number}
  ) => void
  /**
   * To set the page number
   */
  page?: number
  /**
   * Function to handle page change in page number
   */
  pageHandler?: (newValue: number) => void
  /**
   * Array to set row per page options
   */
  rowPerPageOptions?: {label: string; id: number}[]
  /**
   * Default value of pagination
   */
  defaultRowValue?: {label: string; id: number}
  /**
   * To enable the pagination
   */
  enablePagination: boolean
  /**
   * Column design of child data table
   */
  childColumnConfig?: Array<ColumnConfig<K>>
  /**
   * To enable child table
   */
  enableChildTable?: boolean
  /**
   * At which key child table is present inside the data
   */
  childTableKey?: string
  /**
   * To enable the stickyHeader
   */
  enableStickyHeader?: boolean
  /**
   * On row click
   */
  onRowClick?: (row: T) => void
  /**
   * To enable the child header
   */
  enableParentHeader?: boolean
  /**
   * To enable infiniteScroll
   */
  enableInfiniteScroll?: boolean
  /**
   * To display loader while next page is loading
   */
  loadingNextPageItems?: boolean
  /**
   * function to be called on scrollend
   */
  onScrollToPageEnd?: () => void
  /**
   * In case of sticky Header , kindly fix the height of table container
   */
  tableContainerHeight?: number | string
  /**
   * function to be called on icon list element click
   */
  onIconListElementClick?: (
    event: React.MouseEvent<HTMLDivElement>,
    rowIndex,
    columnIndex
  ) => void
  /**
   * function to be called on icon button click
   */
  onIconButtonClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
    index
  ) => void
  /**
   * To change theme
   */
  theme?: string
  /**
   * To provide the column name for last edit comparison
   */
  lastEditedRowKey?: string | null | undefined
  /**
   * To provide the value of column name for last edit comparison
   */
  lastEditedRowKeyValue?: string | boolean | number | null | undefined
  /**
   * On mouse leave event
   */
  onMouseLeave?: (e) => void
}

export function Datatable<T, K = void>(props: DatatableProps<T, K>) {
  const {
    data,
    onRequestSort,
    onSelectAllClick,
    orderBy,
    order,
    activeSortColId,
    columnConfig,
    disableItems,
    size,
    indexKeyName,
    defaultSelection,
    enableHeader,
    singleSelection,
    enableSelection,
    enableSelectionColumn,
    defaultRowValue,
    rowPerPageOptions,
    page,
    pageHandler,
    rowsPerPage,
    rowsPerPageHandler,
    totalRow,
    enablePagination,
    childColumnConfig,
    enableChildTable,
    childTableKey,
    enableStickyHeader,
    enableParentHeader,
    enableInfiniteScroll,
    loadingNextPageItems,
    onScrollToPageEnd,
    tableContainerHeight,
    onIconListElementClick,
    onIconButtonClick,
    onRowClick,
    loading,
    infiniteScrollLoader,
    lastEditedRowKeyValue,
    lastEditedRowKey,
    onMouseLeave
  } = props
  const [selectedRow, setSelectedRow] = useState<Array<number>>([])
  const lastRow = useRef(null)
  const {theme} = useBitThemeContext()
  useEffect(() => {
    if (onSelectAllClick) onSelectAllClick(selectedRow)
  }, [selectedRow])

  useEffect(() => {
    let observer
    if (enableInfiniteScroll && totalRow) {
      observer = new IntersectionObserver(([entry]) => {
        if (
          entry.isIntersecting &&
          data.length < totalRow &&
          !loadingNextPageItems &&
          onScrollToPageEnd
        ) {
          onScrollToPageEnd()
        }
      })
      if (lastRow.current) {
        observer.observe(lastRow.current)
      }
    }
    return () => {
      if (enableInfiniteScroll && observer) {
        observer.disconnect()
      }
    }
  }, [data])
  const tableContainerStyles =
    theme === 'dark'
      ? tableContainerDarkThemeStyle
      : tableContainerLightThemeStyle

  const paperContainerStyles =
    theme === 'dark'
      ? paperContainerDarkThemeStyle
      : paperContainerLightThemeStyle

  const totalRows = totalRow ? totalRow : defaultTotalRow
  const pages = page ? page : defaultPages
  const rowPerPageOption = rowPerPageOptions
    ? rowPerPageOptions
    : defaultRowPerPageValue
  const rowsPerPages = rowsPerPage ? rowsPerPage : defaultRowPerPage
  const pageHandlers = pageHandler ? pageHandler : defaultPageHandler
  const defaultRowValues = defaultRowValue
    ? defaultRowValue
    : defaultRowPerPageValue[0]
  const rowsPerPageHandlers = rowsPerPageHandler
    ? rowsPerPageHandler
    : defaultrowsPerPageHandler
  const tableContainerHeights = tableContainerHeight ?? '100%'

  const handleClick = (row) =>
    singleSelection
      ? handleRadioSelect<T>(row[indexKeyName], setSelectedRow, onRowClick, row)
      : handleSelect<T>(
          row[indexKeyName],
          selectedRow,
          setSelectedRow,
          onRowClick,
          row
        )

  return (
    <Paper sx={{...paperContainerStyles}}>
      <TableContainer
        component={Paper}
        sx={{
          ...tableContainerStyles,
          maxHeight: enableStickyHeader ? tableContainerHeights : '100%'
        }}
      >
        <Table
          onMouseLeave={(e) => {
            if (onMouseLeave) onMouseLeave(e)
          }}
          sx={
            theme === 'dark'
              ? tableRowDarkThemeStyles
              : tableRowLightThemeStyles
          }
          stickyHeader={enableStickyHeader}
        >
          {enableHeader && (
            <DataTableHeader<T>
              onRequestSort={onRequestSort}
              orderBy={orderBy}
              order={order}
              activeSortColId={activeSortColId}
              singleSelection={singleSelection}
              defaultSelection={defaultSelection}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              indexKeyName={indexKeyName}
              data={data}
              disableItems={disableItems}
              columnConfig={columnConfig}
              enableChildTable={enableChildTable}
              enableParentHeader={enableParentHeader}
              enableSelectionColumn={enableSelectionColumn}
              theme={theme}
            />
          )}
          <DataTableBody<T, K>
            rowsPerPage={rowsPerPages}
            loading={loading}
            infiniteScrollLoader={infiniteScrollLoader}
            enableChildTable={enableChildTable}
            childColumnConfig={childColumnConfig}
            singleSelection={singleSelection}
            defaultSelection={defaultSelection}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            indexKeyName={indexKeyName}
            data={data}
            disableItems={disableItems}
            enableSelection={enableSelection}
            size={size}
            columnConfig={columnConfig}
            childTableKey={childTableKey}
            onRowClick={(row) => handleClick(row)}
            lastRow={lastRow}
            onIconListElementClick={onIconListElementClick}
            onIconButtonClick={onIconButtonClick}
            enableSelectionColumn={enableSelectionColumn}
            theme={theme}
            lastEditedRowKey={lastEditedRowKey}
            lastEditedRowKeyValue={lastEditedRowKeyValue}
          />
        </Table>
      </TableContainer>
      {enablePagination && (
        <DatatableFooter
          theme={theme}
          defaultRowValue={defaultRowValues}
          rowPerPageOptions={rowPerPageOption}
          page={pages}
          pageHandler={pageHandlers}
          rowsPerPage={rowsPerPages}
          rowsPerPageHandler={rowsPerPageHandlers}
          totalRow={totalRows}
        />
      )}
    </Paper>
  )
}

Datatable.defaultProps = {
  enableSelection: false,
  enableExpand: false,
  singleSelection: false,
  enableHeader: true,
  enableStickyHeader: false,
  enablePagination: false,
  loading: false,
  theme: 'dark'
}
