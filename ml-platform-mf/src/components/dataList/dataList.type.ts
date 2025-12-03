// TODO: Create Seperate PR to send parent typing through genric.
import {WithStyles} from '@mui/styles'
import React, {ReactElement} from 'react'
import {IColumnConfig} from '../../types/columnConfig.type'
import {styles} from './dataListJss'

export type alignSelf = 'left' | 'right' | 'inherit' | 'center' | 'justify'
export interface IDefaultProps {
  data: Array<any>
  rowsPerPage: number
  order: 'asc' | 'desc'
  orderBy: string
  shouldEnableSelection: boolean
  singleSelection: boolean
  disableHeader: boolean
  enablePagination: boolean
  showEmptyRows: boolean
  rowsPerPageOptions: Array<number>
  loader: boolean
  expansionList: {}
  multipleExpansion: boolean
  enableShortcuts: boolean
  disableTableShadow: boolean
  disabledHover: boolean
  stickyHeader: boolean
  noResultsFoundMessage: string
  isNoResultDueToError: boolean
}
export interface IPropsDataList<T = unknown> extends WithStyles<typeof styles> {
  data: Array<T>
  onItemClick?: (param: Array<number> | number) => void
  // TODO: Deprecate this prop
  allMatchesSelected?: boolean
  onPageChange?: (page: number, rowsPerPage: number) => void
  onSelectAllClick?: (params: any) => void
  onPageSizeChange?: (params: number) => void
  deleteItem?: (param: any) => void
  totalCount?: number
  order?: 'asc' | 'desc'
  orderBy?: string
  columnConfig: Array<IColumnConfig<IPropsDataList<T>>>
  shouldEnableSelection?: boolean
  singleSelection?: boolean
  rowsPerPage: number
  enablePagination?: boolean
  indexKeyName?: string
  defaultSelection?: number | Array<number>
  rowsPerPageOptions?: Array<number>
  showEmptyRows?: boolean
  onClick?: (e: React.MouseEvent, id: string, item?: T) => void
  onDoubleClick?: (e: React.MouseEvent, id: string, item?: T) => void
  disableSelected?: boolean
  disableHeader?: boolean
  onBtnClick?: (id: unknown, columnName: string, item?: T) => void
  onRequestSort?: (id: unknown, columnName: string, order: string) => void
  offset?: number
  allSelected?: boolean
  expansionElement?: (prop: IPropsDataList<T>, item: T) => ReactElement
  expansionList?: {[key: string]: boolean}
  expandAll?: boolean
  onExpandAllChange?: (expansionStatus: boolean) => void
  loader: boolean
  multipleExpansion?: boolean
  enableShortcuts?: boolean
  onHoverRowChange?: (row: number) => void
  onBodyMouseEnter?: (e: React.MouseEvent) => void
  rowClass?: string
  disableTableShadow?: boolean
  disabledHover?: boolean
  dataTest?: string
  disableItems?: Array<number>
  stickyHeader: boolean
  tableRef?: React.RefObject<HTMLInputElement>
  collapsable?: boolean
  collapsableColumn?: string
  onExapndItem?: (index: number) => void
  noResultsFound?: boolean
  isFilteredResponse?: boolean
  noResultsFoundMessage?: string
  isNoResultDueToError?: boolean
  selectedRows?: any[]
}
