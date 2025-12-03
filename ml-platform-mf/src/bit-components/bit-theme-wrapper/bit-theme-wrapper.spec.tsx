import {render} from '@testing-library/react'
import React from 'react'
import {BasicBitThemeWrapper} from './bit-theme-wrapper.composition'

it('should render with the correct text', () => {
  const {getByText} = render(<BasicBitThemeWrapper />)
  const rendered = getByText('hello world!')
  expect(rendered).toBeTruthy()
})
