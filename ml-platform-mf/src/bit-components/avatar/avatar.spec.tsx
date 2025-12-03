import {render} from '@testing-library/react'
import React from 'react'
import {AvatarWithImage} from './avatar.composition'

describe('avatar', () => {
  it('should render avatar', () => {
    const {getByTestId} = render(<AvatarWithImage />)
    const rendered = getByTestId('basic-avatar')
    expect(rendered).toBeTruthy()
  })
})
