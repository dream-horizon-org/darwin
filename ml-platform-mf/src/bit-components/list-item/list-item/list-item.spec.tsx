import {render} from '@testing-library/react'
import React from 'react'
import {ListItemChildren} from './list-item.composition'

describe('List item', () => {
  test('list item component should render', () => {
    const {getByText} = render(<ListItemChildren />)
    const rendered = getByText('Title')
    expect(rendered).toBeTruthy()
  })
  test('should render the children', () => {
    const {getByText} = render(<ListItemChildren />)
    const rendered = getByText('Title')
    expect(rendered).toBeTruthy()
  })
})
