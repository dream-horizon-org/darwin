import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {SurfaceTypes} from './constants'
import {stylesDarkTheme} from './styles/surfaceDarkThemeStyles'
import {stylesLightTheme} from './styles/surfaceLightThemeStyles'

export type SurfaceProps = {
  /**
   * To provide the type of background to surface component
   */
  type?: string
  /**
   * To render the child component
   */
  children: ReactNode
  /**
   * Console Variant
   */
  consoleSurface?: boolean
  /**
   * Border Radius required for the component
   */
  borderRadius?: number
  /**
   * Padding required for the component
   */
  padding?: number
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function Surface(props: SurfaceProps) {
  const {borderRadius, padding} = props
  const darkClasses = darkTheme({borderRadius, padding})
  const lightClasses = lightTheme({borderRadius, padding})
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  const {type, children, consoleSurface} = props
  return (
    <div
      data-testid='surface-element'
      className={`${classes.banner} ${classes.surfaceProps}  ${type} ${
        consoleSurface && classes.consoleVariant
      }`}
    >
      {children}
    </div>
  )
}

Surface.defaultProps = {
  type: SurfaceTypes.Primary,
  padding: '0px',
  borderRadius: '0px',
  theme: 'dark'
}
