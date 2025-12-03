import React from 'react'
import {Pagination} from '../pagination/index'

export type DatatableFooterProps = {
  totalRow: number
  rowsPerPage: {label: string; id: number}
  rowsPerPageHandler: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: {label: string; id: number}
  ) => void
  page: number
  pageHandler: (newValue: number) => void
  rowPerPageOptions: {label: string; id: number}[]
  defaultRowValue: {label: string; id: number}
  theme?: string
}

export default function DatatableFooter(props: DatatableFooterProps) {
  const {
    defaultRowValue,
    rowPerPageOptions,
    page,
    pageHandler,
    rowsPerPage,
    rowsPerPageHandler,
    totalRow,
    theme
  } = props
  return (
    <Pagination
      theme={theme}
      defaultRowValue={defaultRowValue}
      rowPerPageOptions={rowPerPageOptions}
      page={page}
      pageHandler={pageHandler}
      rowsPerPage={rowsPerPage}
      rowsPerPageHandler={rowsPerPageHandler}
      totalRow={totalRow}
    />
  )
}
