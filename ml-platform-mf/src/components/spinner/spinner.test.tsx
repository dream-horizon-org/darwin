import {render} from '@testing-library/react'
import React from 'react'
import Spinner from './spinner'

describe('Spinner', () => {
  test('should render', () => {
    const {container} = render(<Spinner show={true} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
