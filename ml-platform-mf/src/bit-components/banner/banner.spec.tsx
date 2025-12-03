import {render} from '@testing-library/react'
import React from 'react'
import {ActionButton, DefaultBanner} from './banner.composition'

describe('banner', () => {
  const possibleValues = [
    'This is a success message!',
    'This is a information message!',
    'This is a failure message!',
    'This is a warning message!'
  ]
  it('should render with the correct text inside banner component', () => {
    const {queryByText} = render(<DefaultBanner />)

    let bannerStatus: HTMLElement | null = null
    for (const value of possibleValues) {
      bannerStatus = queryByText(value)
      if (bannerStatus) {
        break
      }
    }
    expect(bannerStatus).toBeTruthy()
  })

  it('should render with the correct text inside banner component', () => {
    const {queryByText} = render(<ActionButton />)

    let bannerStatus: HTMLElement | null = null
    for (const value of possibleValues) {
      bannerStatus = queryByText(value)
      if (bannerStatus) {
        break
      }
    }
    expect(bannerStatus).toBeTruthy()
  })
})
