import {render} from '@testing-library/react'
import React from 'react'
import {LoaderSize} from './constants'
import {ProgressCircle} from './progress-circle'

describe('loader', () => {
  it('should render large loader', () => {
    const loader = render(<ProgressCircle size={LoaderSize.Large} />)
    const actualWidth = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width
    const actualHeight = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width

    const expectedWidth = `${LoaderSize.Large}px`
    const expectedHeight = `${LoaderSize.Large}px`
    expect(actualWidth).toBe(expectedWidth)
    expect(actualHeight).toBe(expectedHeight)
  })
  it('should render Medium loader', () => {
    const loader = render(<ProgressCircle size={LoaderSize.Medium} />)
    const actualWidth = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width
    const actualHeight = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width

    const expectedWidth = `${LoaderSize.Medium}px`
    const expectedHeight = `${LoaderSize.Medium}px`
    expect(actualWidth).toBe(expectedWidth)
    expect(actualHeight).toBe(expectedHeight)
  })
  it('should render Small loader', () => {
    const loader = render(<ProgressCircle size={LoaderSize.Small} />)
    const actualWidth = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width
    const actualHeight = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width

    const expectedWidth = `${LoaderSize.Small}px`
    const expectedHeight = `${LoaderSize.Small}px`
    expect(actualWidth).toBe(expectedWidth)
    expect(actualHeight).toBe(expectedHeight)
  })
  it('should render ExtraSmall loader', () => {
    const loader = render(<ProgressCircle size={LoaderSize.ExtraSmall} />)
    const actualWidth = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width
    const actualHeight = loader.baseElement.querySelector<HTMLElement>(
      '.MuiCircularProgress-root'
    )?.style?.width

    const expectedWidth = `${LoaderSize.ExtraSmall}px`
    const expectedHeight = `${LoaderSize.ExtraSmall}px`
    expect(actualWidth).toBe(expectedWidth)
    expect(actualHeight).toBe(expectedHeight)
  })
})
