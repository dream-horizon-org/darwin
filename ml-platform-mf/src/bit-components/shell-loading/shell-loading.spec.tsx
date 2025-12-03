import {render} from '@testing-library/react'
import React from 'react'
import {BasicShellLoading} from './shell-loading.composition'

it('should render with the correct text', () => {
  const {getByTestId} = render(<BasicShellLoading />)
  const rendered = getByTestId('shell-loading')
  expect(rendered).toBeTruthy()
})
