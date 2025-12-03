import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Radio} from './radio'

describe('RadioButton', () => {
  test('radio button should renders', () => {
    const func = jest.fn()
    const checked = false
    render(<Radio value='radio' checked={checked} onChange={func} />)
    const radio = screen.getByRole('radio')
    expect(radio).toMatchSnapshot()
  })
  test('radio Button should render with text', () => {
    const func = jest.fn()
    const checked = false
    render(
      <Radio
        text='Radio Button'
        value='radio'
        checked={checked}
        onChange={func}
      />
    )
    expect(screen.getByText('Radio Button')).toBeTruthy()
  })

  test('radio button onChange should work', () => {
    const func = jest.fn()
    const checked = false
    render(<Radio value='radio' checked={checked} onChange={func} />)
    const radio = screen.getByRole('radio')
    fireEvent.click(radio)
    expect(func).toBeCalled()
  })
})
