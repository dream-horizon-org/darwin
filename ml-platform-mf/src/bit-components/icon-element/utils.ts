import config from 'config'
import {IconSizes, IconVariants} from './constants'

export const renderIcon = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const updateIconSize = (styles, value?: IconSizes) => {
  switch (value) {
    case 'small':
      return styles.smallIcon
    case 'medium':
      return styles.mediumIcon
    case 'large':
      return styles.largeIcon
    default:
      return styles.mediumIcon
  }
}

export const updateIconState = (
  styles,
  value?: IconVariants,
  isDisabled?: boolean
) => {
  if (!isDisabled) {
    switch (value) {
      case 'primary':
        return styles.primaryState
      case 'success':
        return styles.successState
      case 'error':
        return styles.errorState
      default:
        return styles.primaryState
    }
  } else {
    return styles.disabledState
  }
}
