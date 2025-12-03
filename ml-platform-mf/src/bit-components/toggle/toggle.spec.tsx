import {render} from '@testing-library/react'
import React from 'react'
import {Toggle} from './toggle'

describe('ToggleSwitch', () => {
  test('Toggle switch should renders', () => {
    const func = jest.fn()
    const checked = false
    render(<Toggle value='toggle' checked={checked} onChange={func} />)
  })
})
