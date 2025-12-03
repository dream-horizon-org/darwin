import {ToggleButton as MaterialToggleButton} from '@mui/material'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import React from 'react'

import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {ToggleButtonType, ToggleButtonVariants} from './constants'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'

export type ToggleButtonProps = {
  /**
   * For deciding if a text-button or icon-button to be rendered
   */
  buttonType: ToggleButtonType
  /**
   * For providing onChange function(event: React.MouseEvent<HTMLElement>, value: string) => void
   */
  handleChange: (event: React.MouseEvent<HTMLElement>, value: string) => void
  /**
   * 	The currently selected value within the group
   */
  currentValue?: string
  /**
   * 	Array of object maxsize=2
   */
  list:
    | Array<{
        text: string
        value: string
        disabled?: boolean
        testIdentifier?: string
      }>
    | Array<{
        value: string
        icon: Icons
        disabled?: boolean
        testIdentifier?: string
      }>
  /**
   * 	For using different variants
   */
  variant: ToggleButtonVariants
  /**
   * 	To change theme
   */
  theme?: string
}

export function ToggleButton(props: ToggleButtonProps) {
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const toggleButtonStyles = theme === 'dark' ? dark : light
  return (
    <ToggleButtonGroup
      color='primary'
      value={props.currentValue}
      exclusive
      onChange={props.handleChange}
      sx={toggleButtonStyles}
      className={`${props.variant}`}
    >
      {props?.list?.map((element, index) => {
        return (
          <MaterialToggleButton
            key={element.value}
            value={element.value}
            disabled={element?.disabled}
            className={`button-${index}`}
            data-testid={element.testIdentifier}
            data-test={element.testIdentifier}
          >
            {props.buttonType === ToggleButtonType.STRING ? (
              element.text
            ) : (
              <span className={`icon ${element.icon}`}></span>
            )}
          </MaterialToggleButton>
        )
        // return null
      })}
    </ToggleButtonGroup>
  )
}
ToggleButton.defaultProps = {
  theme: 'dark'
}
