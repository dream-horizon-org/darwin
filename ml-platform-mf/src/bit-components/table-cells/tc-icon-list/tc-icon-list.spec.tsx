import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcIconList} from './tc-icon-list.composition'

describe('icon-list', () => {
  it('should render icon-list', () => {
    const {getByTestId} = render(<BasicTcIconList />)
    const rendered = getByTestId('icon-list')
    expect(rendered).toBeTruthy()
  })
})
