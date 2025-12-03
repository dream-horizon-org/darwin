import {render} from '@testing-library/react'
import React from 'react'
import {BasicTooltip} from './tooltip.composition'

describe('tooltip', () => {
  it('should render with the correct text for tooltip components', () => {
    const {getByText} = render(<BasicTooltip />)
    const rendered = getByText('Tool Tip Text')
    expect(rendered).toBeTruthy()
  })
  // it('tooltip should render', () => {
  //   const {getByText} = render(<BasicTooltip />)
  //   const tooltip = getByText('Tool Tip Text')
  //   expect(tooltip).toMatchSnapshot()
  // })
})
