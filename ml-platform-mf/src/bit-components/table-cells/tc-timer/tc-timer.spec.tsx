import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcTimer} from './tc-timer.composition'

it('should render with the correct text', () => {
  const {getByTestId} = render(<BasicTcTimer />)
  const rendered = getByTestId('timer')
  expect(rendered).toBeTruthy()
})
