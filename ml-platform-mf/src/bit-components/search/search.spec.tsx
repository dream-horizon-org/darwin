import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Search} from './search'

describe('search component tests', () => {
  test('search component onSearch function should work', () => {
    const mockFn = jest.fn()
    render(<Search testIdentifier={'test'} onSearch={mockFn} />)
    const search = screen.getByTestId('test')
    fireEvent.keyPress(search, {key: 'Enter', code: 'Enter', charCode: 13})
    expect(mockFn).toBeCalled()
  })

  test('search component render the initial value', () => {
    const mockFn = jest.fn()
    const initialValue = 'initialValue'
    const serach = render(
      <Search
        testIdentifier={'test'}
        onSearch={mockFn}
        initiaValue={initialValue}
      />
    )
    const actualValue = serach.baseElement.querySelector('input')?.value
    expect(actualValue).toBe(initialValue)
  })

  test('search component icon should render', () => {
    const mockFn = jest.fn()
    const initialValue = 'initialValue'
    render(
      <Search
        testIdentifier={'test'}
        initiaValue={initialValue}
        onSearch={mockFn}
      />
    )
    const icon = screen.getAllByTestId('leading-icon')[0]
    expect(icon).toHaveClass('icon-close')
  })

  test('searchByArray should render', () => {
    const mockFn = jest.fn()
    const arr = [
      {value: 1, text: 'one'},
      {value: 2, text: 'two'},
      {value: 3, text: 'three'}
    ]
    const serach = render(
      <Search
        testIdentifier={'test'}
        onSearch={mockFn}
        searchByOptions={arr}
        testIdentifierForSearchSelect={'select'}
      />
    )
    const actualValue = serach.baseElement.querySelector(
      '[data-testid="select"]'
    )?.childElementCount
    expect(actualValue).toBe(arr.length + 1)
  })
})
