import {render, screen} from '@testing-library/react'
import React from 'react'
import {BasicChip, SelectedChip} from './chip.composition'

describe('chip', () => {
  it('should render with the correct text', () => {
    render(<BasicChip />)
    const chip = screen.getByRole('button', {name: /Label/i})
    expect(chip).toHaveTextContent('Label')
  })

  it('should render selected color chip', () => {
    render(<SelectedChip />)
    const chip = screen.getByRole('button', {name: /Label/i})
    expect(chip).toHaveStyle({backgroundColor: '#0057AF'})
  })
})
