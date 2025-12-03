import {render, screen} from '@testing-library/react'
import React from 'react'
import {DatePicker} from './date-picker'

describe('Date picker', () => {
  test('date picker component should render with label', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    render(
      <DatePicker
        value={value}
        onChange={mockFn}
        label='Basic Date picker'
        testIdentifier='datePicker-1'
      />
    )
    expect(screen.getByLabelText('Basic Date picker')).toBeTruthy()
  })
  test('date picker component should render with label', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    render(
      <DatePicker
        value={value}
        onChange={mockFn}
        label='Basic Date picker'
        testIdentifier='datePicker-1'
      />
    )
    expect(screen.getByLabelText('Basic Date picker')).toBeTruthy()
  })

  test('should render the initial value', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    const datePicker = render(
      <DatePicker value={value} onChange={mockFn} label='Basic Date picker' />
    )
    const actualValue = datePicker.baseElement.querySelector('input')?.value
    const expectedValue = '11/07/2022'
    expect(actualValue).toBe(expectedValue)
  })
})
