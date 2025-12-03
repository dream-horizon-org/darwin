import {render, screen} from '@testing-library/react'
import React from 'react'
import {BasicTabs, GroupOfTabs, TabWithIcon} from './tabs.composition'
import {getTabClassName, getTabIconClassName, getTabValue} from './utils'

describe('tabs', () => {
  test('should render disable tab', () => {
    render(<GroupOfTabs />)
    const tab = screen.getAllByRole('tab')
    expect(tab[2]).toHaveAttribute('disabled')
  })

  test('should render selected tab', () => {
    render(<BasicTabs />)
    const tab = screen.getByRole('tab')
    expect(tab).toHaveClass('Mui-selected')
  })

  test('should render tab with icon', () => {
    render(<TabWithIcon />)
    const tab = screen.getByTestId('tabWithIcon')
    expect(tab).toHaveClass('icon')
  })
})

describe('getTabValue', () => {
  test('value should get precedence over index', () => {
    const value = 3
    const index = 0
    const actualVal = getTabValue(value, index)
    expect(actualVal).toBe(value)
  })
})

describe('getTabClassName', () => {
  test('className should include selectedTab', () => {
    const expectedClassName = 'tab selectedTab'
    const actualClassName = getTabClassName(1, 1, false)
    expect(actualClassName).toBe(expectedClassName)
  })

  test('className should include disableTab', () => {
    const expectedClassName = 'tab disableTab'
    const actualClassName = getTabClassName(1, 2, true)
    expect(actualClassName).toBe(expectedClassName)
  })
})

describe('getTabIconClassName', () => {
  test('className should include selectedTabIcon', () => {
    const expectedClassName = 'icon selectedTabIcon'
    const actualClassName = getTabIconClassName(1, 1, false)
    expect(actualClassName).toBe(expectedClassName)
  })

  test('className should include disabledTabIcon', () => {
    const expectedClassName = 'icon disabledTabIcon'
    const actualClassName = getTabIconClassName(1, 2, true)
    expect(actualClassName).toBe(expectedClassName)
  })
})
