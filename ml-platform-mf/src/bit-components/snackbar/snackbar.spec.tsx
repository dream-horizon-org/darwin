import {render} from '@testing-library/react'
import React from 'react'
import {SuccessSnackbar} from './snackbar.composition'
describe('snackbar', () => {
  it('should render with the correct text', () => {
    const {getByText} = render(<SuccessSnackbar />)
    const rendered = getByText('This is a success message!')
    expect(rendered).toBeTruthy()
  })
})
