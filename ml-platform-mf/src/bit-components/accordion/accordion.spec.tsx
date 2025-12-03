import {render} from '@testing-library/react'
import React from 'react'
import {Default} from './accordion.composition'

describe('Default Accordion Component', () => {
  it('renders without crashing', () => {
    const {container} = render(<Default />)
    expect(container).toBeInTheDocument()
  })
})
