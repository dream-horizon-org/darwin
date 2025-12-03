import {Radio as MaterialUiRadio} from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import styles from './radio.style'
import {stylesDarkTheme} from './styles/radioDarkThemeStyles'
import {stylesLightTheme} from './styles/radioLightThemeStyles'

export type RadioProps = {
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
   * The name attribute specifies a name for an HTML element.
   */
  name?: string
  /**
   * To chagne theme
   */
  theme?: string
  /**
   * Value decides the min-width of the radio component (in pixels).
   */
  minWidth?: number
}

export const Radio = ({
  onChange,
  text,
  disabled,
  value,
  checked,
  minWidth
}: RadioProps) => {
  const classes = styles({minWidth})
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const radioStyles = () => {
    const style = theme === 'dark' ? dark : light
    return style
  }

  return (
    <FormControlLabel
      label={text || ''}
      value={value}
      className={`${disabled ? 'disabled' : ''} ${checked ? 'checked' : ''} ${
        classes.radioProps
      }`}
      control={
        <MaterialUiRadio
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange) onChange(event)
          }}
          disabled={disabled}
          checked={checked}
        />
      }
      sx={radioStyles()}
    />
  )
}

Radio.defaultProps = {
  text: ' ',
  theme: 'dark',
  minWidth: '30'
}
