import {render} from '@testing-library/react'
import React from 'react'
import {BasicDivider} from './divider.composition'
describe('divider', () => {
  it('should render surface with correct dashed type', () => {
    const {getByTestId} = render(<BasicDivider />)
    const rendered = getByTestId('divider-element')

    expect(rendered).toHaveClass('solid', 'horizontal')
  })
})
