import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {ToggleButtonType, ToggleButtonVariants} from './constants'
import {ToggleButton} from './toggle-button'
import {PrimaryToggleButton} from './toggle-button.composition'
import {mockListTextButton} from './utils'

describe('Toggle Button', () => {
  test('it should render toggle button component', () => {
    render(<PrimaryToggleButton />)
    const toggle = screen.getByTestId('button-1')
    expect(toggle).toMatchSnapshot()
  })

  test('on first button click, it should call the mock function', () => {
    const mockFn = jest.fn()
    const currentValue = ''
    render(
      <ToggleButton
        list={mockListTextButton}
        handleChange={mockFn}
        buttonType={ToggleButtonType.STRING}
        currentValue={currentValue}
        variant={ToggleButtonVariants.PRIMARY}
      />
    )
    const toggle = screen.getByTestId('button-1')
    fireEvent.click(toggle)
    expect(mockFn).toBeCalled()
  })
  test('on second button click, it should call the mock function', () => {
    const mockFn = jest.fn()
    const currentValue = ''
    render(
      <ToggleButton
        list={mockListTextButton}
        handleChange={mockFn}
        buttonType={ToggleButtonType.STRING}
        currentValue={currentValue}
        variant={ToggleButtonVariants.PRIMARY}
      />
    )
    const toggle = screen.getByTestId('button-2')
    fireEvent.click(toggle)
    expect(mockFn).toBeCalled()
  })
})
