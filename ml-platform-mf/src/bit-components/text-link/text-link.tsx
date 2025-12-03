import {Link} from '@mui/material'
import React from 'react'
import {TextLinkSizes, TextLinkVarinats} from './constants'

import Box from '@mui/material/Box'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'

export type TextLinkProps = {
  /**
   * Link address to be provided.
   */
  href?: string
  /**
   * Link text to be rendered.
   */
  text: string
  /**
   * If true, link renderd with an arrow icon.
   */
  icon?: boolean
  /**
   * To change the size of the component.
   */
  size?: TextLinkSizes
  /**
   * To change the variant of the component.
   */
  variant?: TextLinkVarinats
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * If true, will remove hover
   */
  removeHover?: boolean
  /**
   * If true, remove underline
   */
  addCursor?: boolean
  /**
   * To change theme
   */
  theme?: string
}

export const TextLink = ({
  href,
  text,
  icon,
  size,
  variant,
  disabled,
  removeHover,
  addCursor
}: TextLinkProps) => {
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const textLinkStyles = () => {
    const styles = theme === 'dark' ? dark : light
    return styles
  }

  return (
    <Box
      sx={textLinkStyles()}
      className={`wrapper ${variant} ${disabled ? 'disabled' : ''} ${
        removeHover ? 'removeHover' : ''
      } ${addCursor ? 'addCursor' : ''} ${size}`}
    >
      <Link
        underline='none'
        {...(href && {href: !disabled ? href : `javascript:void(0)`})}
        className={`link`}
        rel='noopener'
        target='_blank'
      >
        {text}
      </Link>
      {icon && (
        <span
          className={`${Icons.ICON_CHEVRON_RIGHT} icon`}
          data-testid={'trailing-icon'}
        ></span>
      )}
    </Box>
  )
}

TextLink.defaultProps = {
  variant: TextLinkVarinats.Primary,
  theme: 'dark',
  size: TextLinkSizes.Large
}
