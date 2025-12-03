import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Checkbox} from './checkbox'

describe('Checkbox tests', () => {
  test('checkbox should render', () => {
    const func = jest.fn()
    const checked = false
    render(<Checkbox checked={checked} onChange={func} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toMatchSnapshot()
  })

  test('checkbox onChange should work', () => {
    const func = jest.fn()
    const checked = false
    render(<Checkbox checked={checked} onChange={func} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(func).toBeCalled()
  })

  test('checkbox should render with text', () => {
    const func = jest.fn()
    const checked = false
    render(<Checkbox text='Checkbox' checked={checked} onChange={func} />)
    expect(screen.getByText('Checkbox')).toBeTruthy()
  })
})
