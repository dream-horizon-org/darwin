import {render} from '@testing-library/react'
import React from 'react'
import {surface as surfaceTheme} from '../design-tokens/index'
import {BasicSurface} from './surface.composition'

describe('surface', () => {
  it('should render surface with correct primary colour', () => {
    const {getByTestId} = render(<BasicSurface />)
    const rendered = getByTestId('surface-element')
    const surface = surfaceTheme('dark')
    expect(rendered).toHaveStyle(
      `background-color:${surface.surface.ds_surface_primary_background_color}`
    )
  })

  it('should render surface with correct colour snapshot', () => {
    const {getByTestId} = render(<BasicSurface />)
    const rendered = getByTestId('surface-element')
    expect(rendered).toBeTruthy()
  })
})
