import {render} from '@testing-library/react'
import React from 'react'
import {LargeTcProgressCircle} from './tc-progress-circle.composition'

it('should render with the correct text', () => {
  render(<LargeTcProgressCircle />)
})
