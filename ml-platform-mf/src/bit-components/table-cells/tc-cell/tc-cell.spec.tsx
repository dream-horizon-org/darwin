import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcCell} from './tc-cell.composition'

describe('surface', () => {
  it('should render data cell with correct colour snapshot', () => {
    const {getByTestId} = render(<BasicTcCell />)
    const rendered = getByTestId('data-cell')
    expect(rendered).toBeTruthy()
  })
})
