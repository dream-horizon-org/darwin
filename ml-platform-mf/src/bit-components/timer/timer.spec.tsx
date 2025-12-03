import {render} from '@testing-library/react'
import React from 'react'
import {BasicTimer} from './timer.composition'

it('should render with the correct text', () => {
  const {getByTestId} = render(<BasicTimer />)
  const rendered = getByTestId('timer')
  expect(rendered).toBeTruthy()
})
