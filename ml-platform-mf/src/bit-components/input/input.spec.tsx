import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Icons} from '../icon/index'
import {Input} from './input'

describe('Input Component tests', () => {
  test('input component onChange should work', () => {
    const mockFn = jest.fn()
    const value = ''
    render(<Input value={value} onChange={mockFn} label='Input' name='input' />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, {target: {value: 'change'}})
    expect(mockFn).toBeCalled()
  })

  test('input component icon should render', () => {
    const mockFn = jest.fn()
    const value = ''
    render(
      <Input
        value={value}
        onChange={mockFn}
        label='Input'
        name='input'
        icon={Icons.ICON_HIGHLIGHT_OFF}
      />
    )
    const icon = screen.getByTestId('test-icon')
    expect(icon).toHaveClass('icon-highlight_off')
  })

  test('input component icon onClick should work', () => {
    const mockFn = jest.fn()
    const mockFn1 = jest.fn()
    const value = ''
    render(
      <Input
        value={value}
        onChange={mockFn}
        label='Input'
        name='input'
        onClick={mockFn1}
        icon={Icons.ICON_HIGHLIGHT_OFF}
      />
    )
    const icon = screen.getByTestId('test-icon')
    fireEvent.click(icon)
    expect(mockFn1).toBeCalled()
  })
})
