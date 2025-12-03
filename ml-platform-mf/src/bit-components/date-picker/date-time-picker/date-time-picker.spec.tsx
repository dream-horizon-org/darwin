import {render, screen} from '@testing-library/react'
import React from 'react'
import {DateTimePicker} from './date-time-picker'

describe('DateTimePicker', () => {
  test('date-time picker component should render with label', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    render(
      <DateTimePicker
        value={value}
        onChange={mockFn}
        label='Basic Date picker'
        testIdentifier='datePicker-1'
      />
    )
    expect(screen.getByLabelText('Basic Date picker')).toBeTruthy()
  })
  test('date-time picker component should render with label', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    render(
      <DateTimePicker
        value={value}
        onChange={mockFn}
        label='Basic Date picker'
        testIdentifier='datePicker-1'
      />
    )
    expect(screen.getByLabelText('Basic Date picker')).toBeTruthy()
  })
})
