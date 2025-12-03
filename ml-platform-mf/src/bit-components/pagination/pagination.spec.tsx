import {render, screen} from '@testing-library/react'
import React from 'react'
import {BasicPagination} from './pagination.composition'

describe('Pagination Component tests', () => {
  test('first page button should be disabled', () => {
    render(<BasicPagination />)
    const firstPageButton = screen.getByTestId('firstPageButton')
    expect(firstPageButton).not.toBeEnabled()
  })
  test('previous page button should be disabled', () => {
    render(<BasicPagination />)
    const previousPageButton = screen.getByTestId('previousPageButton')
    expect(previousPageButton).not.toBeEnabled()
  })

  test('next page button should be disabled', () => {
    render(<BasicPagination />)
    const nextPageButton = screen.getByTestId('nextPageButton')
    expect(nextPageButton).toBeEnabled()
  })
  test('last page button should be disabled', () => {
    render(<BasicPagination />)
    const lastPageButton = screen.getByTestId('lastPageButton')
    expect(lastPageButton).toBeEnabled()
  })
})
