import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import {BasicPopout} from './popout.composition'

describe('Popout tests', () => {
  it('should render with the close icon', () => {
    render(<BasicPopout />)
    const clickMeButton = screen.getByText('Open Popout')
    fireEvent.click(clickMeButton)
    const rendered = screen.getByTestId('leading-icon')
    expect(rendered).toBeTruthy()
  })
  it('should render with the correct padding for content test', () => {
    render(<BasicPopout />)
    const clickMeButton = screen.getByText('Open Popout')
    fireEvent.click(clickMeButton)
    const rendered = screen.getByTestId('popout-content')

    expect(rendered).toHaveStyle(`padding:8px 0px`)
  })
})
