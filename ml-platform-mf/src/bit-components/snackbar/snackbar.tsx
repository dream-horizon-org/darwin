import Alert from '@mui/material/Alert'
import MUISnackbar from '@mui/material/Snackbar'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton,
  IconButtonVariants
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {TextButton} from '../text-button/index'
import {HorizontalAlignment, Severity, VerticalAlignment} from './constants'
import {TransitionDirection} from './internals/transitionDirection'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'
import {getButtonClass} from './utils'
export type SnackbarProps = {
  /**
   * To provide the message to banner
   */
  message: string
  /**
   * To open and close the banner
   */
  open: boolean
  /**
   * To set the duration for auto hide
   */
  autoHideDuration?: number
  /**
   * To attach the close handler for close button
   */
  onClose: () => void
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
  severity: Severity
  /**
   * To set the vertical position of snackbar. Options are : Bottom and Top only
   */
  vertical?: VerticalAlignment
  /**
   * To set the horizontal position of snackbar. Options are : Center , Left and Right only
   */
  horizontal?: HorizontalAlignment
  /**
   * To set the icon for banner
   */
  leadingIcon: Icons
  /**
   * To change theme
   */
  theme?: string
}

export function Snackbar(props: SnackbarProps) {
  const {
    message,
    open,
    autoHideDuration,
    onClose,
    buttonParams,
    severity,
    vertical = VerticalAlignment.Bottom,
    horizontal = HorizontalAlignment.Center,
    leadingIcon
  } = props

  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()

  const snackbarStyles = () => {
    const styles = theme === 'dark' ? dark : light
    return styles
  }

  const action = (
    <>
      <div
        className={`${getButtonClass(buttonParams && buttonParams.buttonText)}`}
      >
        {buttonParams && (
          <TextButton
            theme={theme}
            buttonText={buttonParams.buttonText}
            onClick={buttonParams.buttonHandler}
          />
        )}
      </div>
      <IconButton
        theme={theme}
        leadingIcon={Icons.ICON_CLEAR}
        variant={IconButtonVariants.SECONDARY}
        actionableVariants={ActionableIconButtonVariants.ACTIONABLE_SECONDARY}
        actionable={true}
        onClick={onClose}
        actionableSizes={ActionableIconButtonSizes.SMALL}
      />
    </>
  )

  return (
    <MUISnackbar
      sx={snackbarStyles()}
      className={`snackbar ${severity}`}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      message={message}
      anchorOrigin={{vertical, horizontal}}
      TransitionComponent={TransitionDirection(vertical)}
    >
      <Alert
        action={action}
        icon={leadingIcon && <span className={`icon ${leadingIcon}`}></span>}
      >
        {message}
      </Alert>
    </MUISnackbar>
  )
}
Snackbar.defaultProps = {
  theme: 'dark'
}
