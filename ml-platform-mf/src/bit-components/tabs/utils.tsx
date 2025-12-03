import {Icons} from '../icon/index'
import {IconPosition} from './constants'

export const basicTab = [
  {
    label: 'tab 1'
  }
]

export const tabWithCounter = [
  {
    label: 'tab 1',
    counter: 15
  }
]

export const selectedTab = [
  {
    label: 'tab 1'
  }
]

export const disableTab = [
  {
    label: 'tab 1',
    disabled: true
  }
]

export const groupOfTabs = [
  {
    label: 'tab 1'
  },
  {
    label: 'tab 2',
    counter: 5
  },
  {
    label: 'tab 3',
    disabled: true,
    icon: Icons.ICON_ARROW_RIGHT
  }
]

export const tabWithIcon = [
  {
    label: 'tab 1',
    icon: Icons.ICON_ARROW_RIGHT
  }
]

export const getTabValue = (value, index) => {
  if (value !== undefined) return value
  return index
}

export const getTabClassName = (propsValue, currentValue, disabled) => {
  let className = 'tab'
  if (propsValue === currentValue) {
    className += ' selectedTab'
  }

  if (disabled) {
    className += ' disableTab'
  }

  return className
}

export const getTabIconClassName = (propsValue, currentValue, disabled) => {
  let className = 'icon'

  if (propsValue === currentValue) {
    className += ' selectedTabIcon'
  }

  if (disabled) {
    className += ' disabledTabIcon'
  }

  return className
}

export const getIconPositionClassName = (position?) => {
  if (position === IconPosition.LEFT) {
    return 'leftIcon'
  } else {
    return 'rightIcon'
  }
}
