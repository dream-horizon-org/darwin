import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {UnderlineProps} from './constants'
import {
  BasicLink,
  UnderlineLink,
  UnderlineOnHoverLink
} from './link.composition'

describe('Link', () => {
  test('it should render', () => {
    render(<BasicLink href='#'>basic link!</BasicLink>)
    const link = screen.getByRole('link')
    expect(link).toBeTruthy()
  })

  test('should render with href attribute', () => {
    const {getByTestId} = render(
      <BasicLink href='#'>underline link!</BasicLink>
    )
    expect(getByTestId('link')).toHaveAttribute('href', '#')
  })

  test('should have underline attribute for underline links', () => {
    const {getByTestId} = render(
      <UnderlineLink href='#' underline={UnderlineProps.Always}>
        underline link!
      </UnderlineLink>
    )
    expect(getByTestId('link')).toHaveClass('MuiLink-underlineAlways')
  })

  test('should appear underline on hover for underlineOnHover links', () => {
    const {getByTestId} = render(
      <UnderlineOnHoverLink href='#' underline={UnderlineProps.Hover}>
        underline link!
      </UnderlineOnHoverLink>
    )
    const link = getByTestId('link')
    fireEvent.click(link)
    expect(getByTestId('link')).toBeTruthy()
  })
})
