import {Button as MaterialButton} from '@mui/material'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {LoaderSize, ProgressCircle} from '../progress-circle/index'
import {
  ButtonAriaHasPopup,
  ButtonSizes,
  ButtonTypes,
  ButtonVariants
} from './constants'
import {stylesDarkTheme} from './styles/buttonDarkThemeStyles'
import {stylesLightTheme} from './styles/buttonLightThemeStyles'

export type ButtonProps = {
  /**
   * onClick function to be provided.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Button text to be rendered.
   */
  buttonText: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * Icon placed after the text.
   */
  trailingIcon?: Icons
  /**
   * Icon placed before the text.
   */
  leadingIcon?: Icons
  /**
   * To change the size of the component.
   */
  size?: ButtonSizes
  /**
   * To change the variant of the component.
   */
  variant?: ButtonVariants
  /**
   * To give the button type.
   */
  type?: ButtonTypes
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * The label for the Button as a string.
   */
  ariaControl?: string
  /**
   * The ariaHasPopup attribute indicates the availability and type of interactive popup element.
   */
  ariaHasPopup?: ButtonAriaHasPopup
  /**
   * A flag used to show loading state.
   */
  isLoading?: boolean
  /**
   * If true button will take max width.
   */
  maxWidth?: boolean
  /**
   * To change theme
   */
  theme?: string
  /**
   * To change text font
   */
  smallFont?: boolean
  /**
   * To rotate icon
   */
  rotateIcon?: boolean
}
export function Button({
  onClick,
  size,
  buttonText,
  disabled,
  trailingIcon,
  variant,
  leadingIcon,
  testIdentifier,
  type,
  ariaControl,
  ariaHasPopup,
  isLoading,
  maxWidth,
  smallFont,
  rotateIcon
}: ButtonProps) {
  const darkClasses = stylesDarkTheme()
  const lightClasses = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const getButtonStyles = () => {
    return theme === 'dark' ? darkClasses : lightClasses
  }

  return (
    <MaterialButton
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isLoading) onClick(e)
      }}
      disabled={disabled}
      data-test={testIdentifier}
      data-testid={testIdentifier}
      type={type}
      aria-controls={ariaControl}
      aria-haspopup={ariaHasPopup}
      endIcon={
        !isLoading &&
        trailingIcon && (
          <span
            className={`icon ${trailingIcon} ${size}`}
            data-testid={'trailing-icon'}
          ></span>
        )
      }
      startIcon={
        !isLoading &&
        leadingIcon && (
          <span
            className={`icon ${leadingIcon} ${
              rotateIcon ? 'rotateIcon' : null
            }  ${size}`}
            data-testid={'leading-icon'}
          ></span>
        )
      }
      className={`${maxWidth ? 'maxWidth' : null} ${size} ${variant} ${
        smallFont ? 'smallFont' : null
      } ${disabled ? 'disabled' : null} ${leadingIcon ? 'leadingIcon' : ''} ${
        trailingIcon ? 'trailingIcon' : ''
      }`}
      sx={getButtonStyles()}
    >
      {isLoading && (
        <ProgressCircle size={LoaderSize.Small} data-testid={'loadingIcon'} />
      )}
      {!isLoading && buttonText}
    </MaterialButton>
  )
}

Button.defaultProps = {
  size: ButtonSizes.LARGE,
  variant: ButtonVariants.PRIMARY,
  theme: 'dark'
}
