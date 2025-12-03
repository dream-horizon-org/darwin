import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {DividerAlignment, DividerSeverity, DividerTypes} from './constant'
import {stylesDarkTheme} from './styles/dividerDarkThemeStyles'
import {stylesLightTheme} from './styles/dividerLightThemeStyles'

export type DividerProps = {
  /**
   * To set divider type.Types are : dashed and solid
   */
  type?: DividerTypes
  /**
   * TO set the alignment of divider.Alignment are : vertical and horizontal only
   */
  alignment?: DividerAlignment
  /**
   * TO set the severity of divider.Severity are : Error, Active, Success, Generic and default only
   */
  severity?: DividerSeverity
  /**
   * To change theme
   */
  theme?: string
}
export function Divider({type, alignment, severity}: DividerProps) {
  const darkClasses = stylesDarkTheme()
  const lightClasses = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  return (
    <hr
      data-testid='divider-element'
      className={`${classes.divider} ${type} ${alignment} ${severity}`}
    />
  )
}
Divider.defaultProps = {
  type: DividerTypes.Solid,
  alignment: DividerAlignment.Horizontal,
  severity: DividerSeverity.Default,
  theme: 'dark'
}
