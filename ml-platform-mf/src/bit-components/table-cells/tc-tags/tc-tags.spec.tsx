import {render} from '@testing-library/react'
import React from 'react'
import {LargeTableCellTags} from './tc-tags.composition'

describe('table cell tag', () => {
  it('should render table cell tags with correct colour snapshot', () => {
    const rendered = render(<LargeTableCellTags />)
    expect(rendered).toBeTruthy()
  })
})
