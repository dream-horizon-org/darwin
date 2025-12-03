import {render} from '@testing-library/react'
import React from 'react'
import {BasicDatatable} from './datatable.composition'

it('should render with the correct text', () => {
  render(<BasicDatatable />)
})
