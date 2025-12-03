import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcIconButton} from './tc-icon-button.composition'

it('should render the icon button', () => {
  render(<BasicTcIconButton />)
  expect(screen).toBeTruthy()
})
