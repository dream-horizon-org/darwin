import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcAvatars} from './tc-avatars.composition'

it('should render with the correct text', () => {
  const {getByTestId} = render(<BasicTcAvatars />)
  const rendered = getByTestId('extras').children[1].innerHTML
  expect(rendered).toBe('3')
})
