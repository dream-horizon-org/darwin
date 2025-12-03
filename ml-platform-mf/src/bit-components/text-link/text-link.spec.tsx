import {render, screen} from '@testing-library/react'
import React from 'react'
import {TextLink} from './text-link'

describe('Link', () => {
  test('it should render link', () => {
    render(<TextLink href='#' text='Click me' />)
    const link = screen.getByRole('link')
    expect(link).toBeTruthy()
  })

  test('should render with href attribute', () => {
    render(<TextLink href='#' text='TextLink' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#')
  })

  test('should render the text', () => {
    render(<TextLink href='#' text='TextLink' />)
    const link = screen.getByRole('link')
    expect(link).toHaveTextContent('TextLink')
  })

  test('should render with icon', () => {
    render(<TextLink icon={true} href='#' text='TextLink' />)
    const icon = screen.getByTestId('trailing-icon')
    expect(icon).toHaveClass('icon')
  })
})
