import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {IconSizes, IconVariants} from './constants'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'
import {updateIconSize, updateIconState} from './utils'

export type IconElementProps = {
  /**
   * Need to be provied to render icon .
   */
  leadingIcon: Icons
  /**
   * Need to be provied to change compoenent size .
   */
  size?: IconSizes
  /**
   * Need to be provied to change compoenent variant .
   */
  severity?: IconVariants
  /**
   * To provide test Id to icon button
   */
  dataTestId?: string
  /**
   * Flag to disable the icon
   */
  disabled?: boolean
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function IconElement(props: IconElementProps) {
  const {leadingIcon, size, severity, disabled, dataTestId} = props
  const dark = darkTheme()
  const light = lightTheme()
  const {theme} = useBitThemeContext()
  const styles = theme === 'dark' ? dark : light

  return (
    <div
      className={`${styles.iconContainer} ${updateIconState(
        styles,
        severity,
        disabled
      )}`}
    >
      <span
        data-testid={dataTestId}
        className={`icon ${leadingIcon} ${updateIconSize(styles, size)}`}
      ></span>
    </div>
  )
}
IconElement.defauProps = {
  theme: 'dark'
}
