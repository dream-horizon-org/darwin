import {render} from '@testing-library/react'
import React from 'react'
import {EmptyStateWithSubtitle} from './empty-state.composition'

describe('Empty State Component', () => {
  it('renders without crashing', () => {
    const {container} = render(<EmptyStateWithSubtitle />)
    expect(container).toBeInTheDocument()
  })
})
