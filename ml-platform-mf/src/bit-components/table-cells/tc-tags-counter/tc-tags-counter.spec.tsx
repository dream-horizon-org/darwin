import {render} from '@testing-library/react'
import React from 'react'
import {BasicTcTagsCounter} from './tc-tags-counter.composition'

it('should render Basic tc tags', () => {
  render(<BasicTcTagsCounter />)
})
