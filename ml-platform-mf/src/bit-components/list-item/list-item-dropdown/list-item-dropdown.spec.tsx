import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {BasicListItemDropdown} from './list-item-dropdown.composition'

describe('List item Dropdown', () => {
  test('component should render', () => {
    const mockFun = jest.fn()
    const {getByText} = render(<BasicListItemDropdown onClick={mockFun} />)
    const rendered = getByText('Dropdown Item')
    expect(rendered).toMatchSnapshot()
  })
  test('should render the provided text', () => {
    const mockFun = jest.fn()
    const {getByText} = render(<BasicListItemDropdown onClick={mockFun} />)
    const rendered = getByText('Dropdown Item')
    expect(rendered).toBeTruthy()
  })
  test('onClick function should be called on click', () => {
    const mockFun = jest.fn()
    render(<BasicListItemDropdown onClick={mockFun} />)
    const button = screen.getByTestId('testIdentifier')
    fireEvent.click(button)
    expect(mockFun).toBeCalled()
  })
})
