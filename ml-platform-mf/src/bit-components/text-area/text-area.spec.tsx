import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {TextArea} from './text-area'

describe('TextArea', () => {
  test('textArea onChange should work', () => {
    const mockFn = jest.fn()
    const value = ''
    render(
      <TextArea
        value={value}
        onChange={mockFn}
        label='TextArea'
        name='TextArea'
      />
    )
    const textArea = screen.getByRole('textbox')
    fireEvent.change(textArea, {target: {value: 'change'}})
    expect(mockFn).toBeCalled()
  })

  test('textArea should be disabled', () => {
    const mockFn = jest.fn()
    const value = ''
    render(
      <TextArea
        value={value}
        onChange={mockFn}
        label='TextArea'
        name='TextArea'
        disabled={true}
      />
    )
    const textArea = screen.getByRole('textbox')
    expect(textArea).toBeDisabled()
  })
})
