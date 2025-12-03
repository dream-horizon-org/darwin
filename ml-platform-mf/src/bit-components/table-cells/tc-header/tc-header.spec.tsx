import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcHeader} from './tc-header.composition'

it('should render with the correct text', () => {
  render(<BasicTcHeader />)
})
