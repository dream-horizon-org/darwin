import {render} from '@testing-library/react'
import React from 'react'
import {BasicTypography} from './typography.composition'

describe('typography', () => {
  it('should render with the correct text in typography component', () => {
    const {getByText} = render(<BasicTypography />)
    const rendered = getByText('Hello world!')
    expect(rendered).toBeTruthy()
  })
})
