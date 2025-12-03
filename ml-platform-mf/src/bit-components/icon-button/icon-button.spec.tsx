import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Icons} from '../icon/index'
import {IconButton} from './icon-button'

describe('Icon Button tests', () => {
  test('iconButton should render', () => {
    const mockFn = jest.fn()
    render(
      <IconButton leadingIcon={Icons.ICON_HIGHLIGHT_OFF} onClick={mockFn} />
    )
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  test('iconButton onClick should work', () => {
    const mockFn = jest.fn()
    render(
      <IconButton leadingIcon={Icons.ICON_HIGHLIGHT_OFF} onClick={mockFn} />
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockFn).toBeCalled()
  })

  test('iconButton should redner with Icon', () => {
    const mockFn = jest.fn()
    render(
      <IconButton leadingIcon={Icons.ICON_HIGHLIGHT_OFF} onClick={mockFn} />
    )
    const trailingIcon = screen.getByTestId('leading-icon')
    expect(trailingIcon).toHaveClass('icon-highlight_off')
  })
})
