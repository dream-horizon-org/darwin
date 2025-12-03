import {Switch as MaterialUiSwitch} from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'
import React from 'react'

import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {stylesDarkTheme} from './styles/toggleDarkThemeStyles'
import {stylesLightTheme} from './styles/toggleLightThemeStyles'
export type ToggleProps = {
  /**
   * a node to be rendered in the special component.
   */
  /**
   * onChange function to be provided..
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * For providing label text
   */
  text?: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * The value of the component.
   */
  value: string
  /**
   * If true, the component is checked.
   */
  checked?: boolean
  /**
   * If true, the component is required.
   */
  required?: boolean
  /**
   * The name attribute specifies a name for an HTML element.
   */
  name?: string
  /**
   * To chagne theme
   */
  theme?: string
}

export function Toggle({
  onChange,
  text,
  disabled,
  value,
  checked,
  required
}: ToggleProps) {
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const toggleStyles = theme === 'dark' ? dark : light

  return (
    <FormControlLabel
      label={text || ''}
      value={value}
      className={`${disabled ? 'disabled' : ''} ${checked ? 'checked' : ''} `}
      control={
        <MaterialUiSwitch
          onChange={onChange}
          disabled={disabled}
          checked={checked}
          required={required}
        />
      }
      sx={toggleStyles}
    />
  )
}

Toggle.defaultProps = {
  theme: 'dark',
  disabled: false
}
