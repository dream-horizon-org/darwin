import {render} from '@testing-library/react'
import React from 'react'
import {ActiveTagsCounter, BasicTagsCounter} from './tags-counter.composition'

describe('tagsCounter', () => {
  it('should render with the correct text inside tags counter', () => {
    const {getByText} = render(<BasicTagsCounter />)
    const rendered = getByText('0')
    expect(rendered).toBeTruthy()
  })
  it('tagCounter should render', () => {
    const {getByText} = render(<BasicTagsCounter />)
    const tagCounter = getByText('0')
    expect(tagCounter).toMatchSnapshot()
  })
  it('should render with the correct text inside tags counter', () => {
    const {getByText} = render(<ActiveTagsCounter />)
    const tagCounter = getByText('0')
    expect(tagCounter).toBeTruthy()
  })
})
