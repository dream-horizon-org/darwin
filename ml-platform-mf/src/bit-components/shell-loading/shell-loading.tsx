import {Skeleton} from '@mui/material'
import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {AnimationVariants, ShellVariant} from './constants'
import stylesDarkTheme from './styles/darkThemeStyles'
import stylesLightTheme from './styles/lightThemeStyles'

export type ShellLoadingProps = {
  /**
   *
   */
  children?: ReactNode
  /**
   * Animation for the shell loading
   */
  animation?: AnimationVariants
  /**
   * Height of the shell loading
   */
  height?: string | number
  /**
   * Width of the shell loading
   */
  width?: string | number
  /**
   * The type of content that will be rendered
   */
  variant: ShellVariant
  /**
   *
   */
  testIdentifier?: string
  /**
   * To change theme
   */
  theme?: string
}

const darkTheme = stylesDarkTheme()
const lightTheme = stylesLightTheme()

export function ShellLoading({
  testIdentifier,
  animation,
  height,
  variant,
  width,
  children
}: ShellLoadingProps) {
  const dark = darkTheme()
  const light = lightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? dark : light

  return (
    <div className={classes.mainContainer} data-testid={testIdentifier}>
      <Skeleton
        animation={animation}
        height={height}
        width={width}
        variant={variant}
        className={classes.container}
      >
        {children}
      </Skeleton>
    </div>
  )
}

ShellLoading.defaultProps = {
  variant: ShellVariant.TEXT,
  width: '100%',
  height: '100%',
  theme: 'dark'
}
