import {Checkbox as MaterialUiCheckbox} from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {stylesDarkTheme} from './styles/checkboxDarkThemeStyles'
import {stylesLightTheme} from './styles/checkboxLightThemeStyles'

export type CheckboxProps = {
  /**
   * onChange function should be provided.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * If true, the component is checked.
   */
  checked?: boolean
  /**
   * For providing the name attribute of the input element.
   */
  name?: string
  /**
   * To render the Label text.
   */
  text?: string
  /**
   * The default checked state. Use when the component is not controlled.
   */
  defaultChecked?: boolean
  /**
   * If true, the component appears to be in indeterminate state.
   */
  indeterminate?: boolean
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * To change theme
   */
  theme?: string
}

export const Checkbox = ({
  onChange,
  text,
  disabled,
  checked,
  name,
  defaultChecked,
  indeterminate,
  testIdentifier
}: CheckboxProps) => {
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const getCheckboxStyles = theme === 'dark' ? dark : light

  return (
    <FormControlLabel
      sx={getCheckboxStyles}
      disabled={disabled}
      control={
        <div
          className={`container ${checked && 'checked'} ${
            disabled ? 'disabled' : 'enabled'
          }`}
        >
          <div className={`box ${disabled ? 'disabled' : 'enabled'}`}></div>
          <MaterialUiCheckbox
            onChange={onChange}
            disabled={disabled}
            name={name}
            checked={checked}
            defaultChecked={defaultChecked}
            indeterminate={indeterminate}
            data-test={testIdentifier}
          />
        </div>
      }
      label={text || ''}
    />
  )
}

Checkbox.defaultProps = {
  text: '',
  disabled: false,
  indeterminate: false,
  theme: 'dark'
}
