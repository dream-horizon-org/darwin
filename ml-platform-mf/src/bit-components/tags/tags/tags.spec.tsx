import {render} from '@testing-library/react'
import React from 'react'
import {DefaultTags, TagsWithTrailingIcons} from './tags.composition'
describe('tags', () => {
  it('should render with the correct text for tags components', () => {
    const {getByText} = render(<DefaultTags />)
    const rendered = getByText('Label')
    expect(rendered).toBeTruthy()
  })
  it('should render with the correct text inside tags component with icon', () => {
    const {getByText} = render(<TagsWithTrailingIcons />)
    const tags = getByText('Label')
    expect(tags).toBeTruthy()
  })
})
