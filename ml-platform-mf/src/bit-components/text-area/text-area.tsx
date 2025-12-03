import React from 'react'

import {TextField} from '@mui/material'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {TextAreaSizes} from './constants'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'

export type TextAreaProps = {
  /**
   * onChange function to be provided.
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Label content.
   */
  label: string
  /**
   * The value of the input element, required for a controlled component.
   */
  value: string
  /**
   * The name attribute specifies a name for an HTML element..
   */
  name: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * If true, the error state is enabled.
   */
  error?: boolean
  /**
   * To render the helper text.
   */
  assistiveText?: string
  /**
   * To render the counter text.
   */
  counterText?: number
  /**
   * To change the size of the component.
   */
  size?: TextAreaSizes
  /**
   * To display label as placeholder
   */
  showLabelAsPlaceHolder?: boolean
  /**
   * To change theme
   */
  theme?: string
  /**
   * If true, the input element is required.
   */
  required?: boolean
}

export const TextArea = ({
  onChange,
  disabled,
  label,
  assistiveText,
  value,
  counterText,
  error,
  size,
  showLabelAsPlaceHolder,
  required
}: TextAreaProps) => {
  const dark = stylesDarkTheme()
  const light = stylesLightTheme()
  const {theme} = useBitThemeContext()
  const textAreaStyles = () => {
    const styles = theme === 'dark' ? dark : light
    return styles
  }

  return (
    <TextField
      onChange={onChange}
      disabled={disabled}
      value={value}
      fullWidth
      required={required}
      error={error}
      placeholder={showLabelAsPlaceHolder ? label : ''}
      label={showLabelAsPlaceHolder ? '' : label}
      multiline
      rows={3}
      size={size}
      helperText={
        <span className={'helperText'}>
          <span>{assistiveText}</span>
          {counterText && (
            <span className={'counterText'}>{`${
              value?.length || 0
            }/${counterText}`}</span>
          )}
        </span>
      }
      inputProps={{
        style: {height: size === TextAreaSizes.Medium ? '104px' : '100px'}
      }}
      className={`${disabled && 'disabled'} ${size}`}
      sx={textAreaStyles()}
    />
  )
}

TextArea.defaultProps = {
  assistiveText: ' ',
  size: TextAreaSizes.Medium,
  theme: 'dark'
}
