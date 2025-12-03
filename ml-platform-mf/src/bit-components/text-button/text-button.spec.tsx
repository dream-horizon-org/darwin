import {render} from '@testing-library/react'
import React from 'react'
import {SmallTextButton} from './text-button.composition'

it('should render with the correct text', () => {
  const mockFn = jest.fn()
  const {getByText} = render(
    <SmallTextButton onClick={mockFn} buttonText={'BUTTON'} />
  )
  const rendered = getByText('BUTTON')
  expect(rendered).toBeTruthy()
})
