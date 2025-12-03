import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcRadio} from './tc-radio.composition'

it('should render with the correct text', () => {
  const {getByText} = render(<BasicTcRadio />)
  const rendered = getByText('Radio Button')
  expect(rendered).toBeTruthy()
})
