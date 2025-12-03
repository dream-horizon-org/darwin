import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcSelect} from './tc-select.composition'

it('should render with the correct text', () => {
  render(<BasicTcSelect />)
})
