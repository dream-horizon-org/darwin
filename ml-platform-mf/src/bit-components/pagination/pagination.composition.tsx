import config from 'config'
import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Pagination} from './pagination'
const paginationMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}
export const BasicPagination = () => {
  paginationMockFunc()
  const [page, setPage] = React.useState<number>(1)

  const [rowsPerPage, setRowsPerPage] = React.useState<{
    label: string
    id: number
  }>({label: '10', id: 10})
  const rowsPerPageHandler = (
    event: React.SyntheticEvent<Element, Event> | null,
    newRow: {label: string; id: number}
  ) => {
    setRowsPerPage(newRow)
  }
  const pageHandler = (newPage: number) => {
    setPage(newPage)
  }
  const rowPerPageValue = [
    {label: '10', id: 10},
    {label: '20', id: 20},
    {label: '30', id: 30},
    {label: '40', id: 40},
    {label: '50', id: 50},
    {label: '100', id: 100}
  ]

  return (
    <CompositionWrapper>
      <Pagination
        rowPerPageOptions={rowPerPageValue}
        rowsPerPage={rowsPerPage}
        page={page}
        pageHandler={pageHandler}
        defaultRowValue={rowPerPageValue[0]}
        rowsPerPageHandler={rowsPerPageHandler}
        totalRow={5000}
      />
    </CompositionWrapper>
  )
}
