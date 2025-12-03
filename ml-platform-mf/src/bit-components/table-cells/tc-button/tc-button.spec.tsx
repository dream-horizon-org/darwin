import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcButton} from './tc-button.composition'

it('should render with the correct text', () => {
  render(<BasicTcButton />)
})
