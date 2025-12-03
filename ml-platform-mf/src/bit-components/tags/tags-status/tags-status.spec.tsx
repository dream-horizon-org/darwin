import {render} from '@testing-library/react'
import React from 'react'
import {TagsStatusActive} from './tags-status.composition'

describe('tags-status', () => {
  it('should render with the correct text', () => {
    const {queryByText} = render(<TagsStatusActive />)
    const possibleValues = [
      'Draft',
      'Active',
      'Functional',
      'Information',
      'Paused',
      'Error'
    ]
    let tagsStatus: HTMLElement | null = null
    for (const value of possibleValues) {
      tagsStatus = queryByText(value)
      if (tagsStatus) {
        break
      }
    }
    expect(tagsStatus).toBeTruthy()
  })
})
