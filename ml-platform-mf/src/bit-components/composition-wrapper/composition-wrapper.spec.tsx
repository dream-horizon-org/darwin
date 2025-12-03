import {render} from '@testing-library/react'
import React from 'react'
import {BasicCompositionWrapper} from './composition-wrapper.composition'

describe('typography', () => {
  it('should render with the correct text in typography component', () => {
    const {getByText} = render(<BasicCompositionWrapper />)
    const rendered = getByText('Hello world!')
    expect(rendered).toBeTruthy()
  })
})
