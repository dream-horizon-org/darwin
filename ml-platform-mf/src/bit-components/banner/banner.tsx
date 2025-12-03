import {Box} from '@mui/material'
import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton,
  IconButtonVariants
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {TextButton} from '../text-button/index'
import {Typography, TypographyVariants} from '../typography/index'
import {
  stylesDarkTheme,
  typographyDarkStyles
} from './styles/bannerDarkThemeStyles'
import {
  stylesLightTheme,
  typographyLightStyles
} from './styles/bannerLightThemeStyles'

export type BannerProps = {
  /**
   * To provide the message to banner
   */
  message: string
  /**
   * To open and close the banner
   */
  open: boolean
  /**
   * To attach the close handler for close button also need to pass showCloseButton to show close button
   */
  onClose?: () => void
  /**
   * Optional! To send button text and attach button handler inside banner
   */
  buttonParams?: {
    buttonText: string
    buttonHandler: () => void
  }
  /**
   * To set the severity of banner. There are four options : success | warning | failure | information
   */
  severity: string
  /**
   * To set the leading icon for banner
   */
  leadingIcon: Icons
  /**
   * To change theme
   */
  theme?: string
  /**
   * To show close button also need to pass on close to show close button
   */
  showCloseButton?: boolean
  /**
   * to pass JSX
   */
  children?: React.ReactElement<any, any> & ReactNode
}

export function Banner(props: BannerProps) {
  const {
    message,
    open,
    onClose,
    buttonParams,
    severity,
    leadingIcon,
    showCloseButton,
    children
  } = props
  const darkClasses = stylesDarkTheme()
  const lightClasses = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  const typographyStyles =
    theme === 'dark' ? typographyDarkStyles : typographyLightStyles

  return (
    <Box sx={classes}>
      <div className={open ? `banner ${severity}` : `hideBanner`}>
        <div className={`bannerContent`}>
          <span className={`leadingIcon  ${leadingIcon}`}></span>
          {typographyStyles && (
            <Typography
              theme={theme}
              sx={typographyStyles}
              variant={TypographyVariants.Body1}
            >
              {message}
            </Typography>
          )}
          <div
            className={
              buttonParams && buttonParams.buttonText ? `button` : `hideButton`
            }
          ></div>
        </div>
        <div className='bannerRightContent'>
          {buttonParams && (
            <TextButton
              theme={theme}
              buttonText={buttonParams.buttonText}
              onClick={buttonParams.buttonHandler}
            />
          )}

          {children ? children : null}
          {showCloseButton && onClose && (
            <IconButton
              theme={theme}
              leadingIcon={Icons.ICON_CLEAR}
              variant={IconButtonVariants.SECONDARY}
              actionableVariants={
                ActionableIconButtonVariants.ACTIONABLE_SECONDARY
              }
              actionable={true}
              onClick={onClose}
              actionableSizes={ActionableIconButtonSizes.SMALL}
            />
          )}
        </div>
      </div>
    </Box>
  )
}
Banner.defaultProps = {
  theme: 'dark',
  showCloseButton: true
}
