import MUILink from '@mui/material/Link'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {UnderlineProps} from './constants'
import {stylesDarkTheme} from './styles/linkDarkThemeStyles'
import {stylesLightTheme} from './styles/linkLightThemeStyles'

export type LinkProps = {
  /**
   * Text to be rendered.
   */
  children: string
  /**
   * Link address.
   */
  href?: string
  /**
   * To select text decoration.
   */
  underline?: UnderlineProps
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string
  /**
   * To pass onClick function.
   */
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void
  /**
   * To change theme
   */
  theme?: string
}
export function Link(props: LinkProps) {
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const linkStyles = () => {
    const classes = theme === 'dark' ? dark : light
    return classes
  }

  return (
    <MUILink
      data-testid='link'
      href={props?.href}
      onClick={props?.onClick}
      underline={props.underline}
      sx={linkStyles()}
      className={props.className}
    >
      {props.children}
    </MUILink>
  )
}

Link.defaultProps = {
  underline: UnderlineProps.None,
  theme: 'dark'
}
