import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcShellLoading} from './tc-shell-loading.composition'

it('should render with the correct text', () => {
  const {getByTestId} = render(<BasicTcShellLoading />)
  const rendered = getByTestId('shell-loading')
  expect(rendered).toBeTruthy()
})
