import {render, screen} from '@testing-library/react'
import React from 'react'
import {TimePicker} from './time-picker'

describe('Time picker', () => {
  test('time picker component should render with label', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    render(
      <TimePicker
        value={value}
        onChange={mockFn}
        label='Basic Date picker'
        testIdentifier='datePicker-1'
      />
    )
    expect(screen.getByLabelText('Basic Date picker')).toBeTruthy()
  })
  test('time picker component should render with label', () => {
    const mockFn = jest.fn()
    const value = new Date('Mon Jul 11 2022 14:46:06')
    render(
      <TimePicker
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
      <TimePicker value={value} onChange={mockFn} label='Basic Date picker' />
    )
    const actualValue = datePicker.baseElement.querySelector('input')?.value
    const expectedValue = '02:46 pm'
    expect(actualValue).toBe(expectedValue)
  })
})
