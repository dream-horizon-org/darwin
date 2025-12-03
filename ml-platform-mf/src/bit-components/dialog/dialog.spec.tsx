import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {BasicDialog, FooterSecondaryButton} from './dialog.composition'

describe('Dialog', () => {
  test('it should renders the dialog component', () => {
    render(<BasicDialog />)
    const clickMeButton = screen.getByText('Click me')
    fireEvent.click(clickMeButton)
    const dialogBox = screen.getByTestId('dialogBox')
    expect(dialogBox).toBeInTheDocument()
  })

  test('it should render the dialogContent passed inside the dialog component', () => {
    render(<BasicDialog />)
    const clickMeButton = screen.getByText('Click me')
    fireEvent.click(clickMeButton)
    const content = screen.getByText(
      'Are you sure that the experiment has been running long enough to receive sufficient data? Please confirm.'
    )
    expect(content).toBeInTheDocument()
  })

  test('onClick funtion on the primaryButton should work', () => {
    const primaryMockFun = jest.fn()
    const secondaryMockFun = jest.fn()
    render(
      <FooterSecondaryButton
        primaryMockFun={primaryMockFun}
        secondaryMockFun={secondaryMockFun}
      />
    )
    const clickMeButton = screen.getByText('Click me')
    fireEvent.click(clickMeButton)
    const primaryButton = screen.getByTestId('primaryButton')
    fireEvent.click(primaryButton)
    expect(primaryMockFun).toBeCalled()
  })

  test('onClick funtion on the secondaryButton should work', () => {
    const primaryMockFun = jest.fn()
    const secondaryMockFun = jest.fn()
    render(
      <FooterSecondaryButton
        primaryMockFun={primaryMockFun}
        secondaryMockFun={secondaryMockFun}
      />
    )
    const clickMeButton = screen.getByText('Click me')
    fireEvent.click(clickMeButton)
    const secondaryButton = screen.getByTestId('secondaryButton')
    fireEvent.click(secondaryButton)
    expect(secondaryMockFun).toBeCalled()
  })
})
