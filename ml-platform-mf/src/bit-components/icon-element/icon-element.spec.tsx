import {render} from '@testing-library/react'
import React from 'react'
import {icon_button as icon_buttonTheme} from '../design-tokens/index'
import {PrimaryIconSmallElement} from './icon-element.composition'

describe('Icon Elemets tests', () => {
  it('should render icon of small size', () => {
    const {getByTestId} = render(<PrimaryIconSmallElement />)
    const rendered = getByTestId('primary-small')
    // eslint-disable-next-line
    const icon_button = icon_buttonTheme('light')
    expect(rendered).toHaveStyle(
      `font-size: ${icon_button.ds_icon_button_medium_icon_size}px`
    )
  })
})
