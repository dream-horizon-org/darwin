import {Button as MaterialButton} from '@mui/material'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {ButtonSizes} from './constants'
import {stylesDarkTheme} from './styles/textButtonDarkThemeStyles'
import {stylesLightTheme} from './styles/textButtonLightThemeStyles'

export type TextButtonProps = {
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
   * To change the size of the component.
   */
  size?: ButtonSizes
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * If true button will take max width.
   */
  maxWidth?: boolean
  /**
   * To change theme
   */
  theme?: string
}

export function TextButton({
  onClick,
  size,
  buttonText,
  disabled,
  testIdentifier,
  maxWidth
}: TextButtonProps) {
  const darkClasses = stylesDarkTheme()
  const lightClasses = stylesLightTheme()
  const {theme} = useBitThemeContext()

  const getButtonStyles = () => {
    return theme === 'dark' ? darkClasses : lightClasses
  }

  return (
    <MaterialButton
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick(e)
      }}
      disabled={disabled}
      data-test={testIdentifier}
      data-testid={testIdentifier}
      variant='text'
      className={`${maxWidth ? 'maxWidth' : null} ${size} ${
        disabled ? 'disabled' : null
      }`}
      sx={getButtonStyles()}
    >
      {buttonText}
    </MaterialButton>
  )
}
TextButton.defaultProps = {
  size: ButtonSizes.SMALL,
  theme: 'dark'
}
