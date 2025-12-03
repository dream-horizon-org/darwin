import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {
  ButtonWithLeftIcon,
  ButtonWithRightIcon,
  PrimaryButton
} from './button.composition'

describe('Button', () => {
  test('it renders', () => {
    const mockFn = jest.fn()
    render(<PrimaryButton buttonText='Button' onClick={mockFn} />)
    const button = screen.getByTestId('test-identifier')
    expect(button).toBeInTheDocument()
  })

  test('click should work', () => {
    const mockFn = jest.fn()
    render(<PrimaryButton buttonText='Button' onClick={mockFn} />)
    const button = screen.getByTestId('test-identifier')
    fireEvent.click(button)
    expect(mockFn).toBeCalled()
  })

  test('should render with left Icon', () => {
    const mockFn = jest.fn()
    render(<ButtonWithLeftIcon buttonText='Button' onClick={mockFn} />)
    const button = screen.getByTestId('leading-icon')
    expect(button).toHaveClass('icon-highlight_off')
  })

  test('should render with right Icon', () => {
    const mockFn = jest.fn()
    render(<ButtonWithRightIcon buttonText='Button' onClick={mockFn} />)
    const trailingIcon = screen.getByTestId('trailing-icon')
    expect(trailingIcon).toHaveClass('icon-highlight_off')
  })
})
