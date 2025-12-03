import {TextField} from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {FieldVariants, InputSizes} from './constants'
import {inputBorderStyles} from './input.style'
import {stylesDarkThemeInputStyles} from './styles/darkStyleTheme'
import {stylesLightThemeInputStyles} from './styles/lightStyleTheme'

export type InputProps = {
  /**
   * onChange function to be provided.
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Label content.
   */
  label?: string
  /**
   * The value of the input element, required for a controlled component.
   */
  value: string | number
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
   * Icon to be renderd at the end.
   */
  icon?: Icons
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
  size?: InputSizes
  /**
   * Type of the input element. It should be [a valid HTML5 input type]
   */
  inputType?: React.InputHTMLAttributes<unknown>['type']
  /**
   * To define the label as a placeholder.
   */
  showLabelAsPlaceHolder?: boolean
  /**
   * onBlur function for focus out event.
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  /**
   * onFocus function for focus in event.
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  /**
   * autoSave property - to remove border of input once field is out of focus (T&C - value length should be atleast 1 for this property to work)
   */
  autoSave?: boolean
  /**
   * onClick function for the icon.
   */
  onClick?: () => void
  /**
   * input mode numeric, string etc.
   */
  inputMode?: 'numeric'
  /**
   * input mode numeric, string etc.
   */
  useAbsoluteForAssistiveText?: boolean
  /**
   * For no default border
   */
  hideDefaultBorder?: boolean
  /**
   * To change theme
   */
  theme?: string
  /**
   * If true, the input element is required.
   */
  required?: boolean
  /**
   * To set the default value
   */
  defaultValue?: number | string
  /**
   * To set the autofocus
   */
  autoFocus?: boolean
  /**
   * To turn on and off the autofocus
   */
  autoComplete?: string
  /**
   * To define input field variants
   */
  fieldVariant: 'withOutline' | 'withoutOutline'
  /**
   *
   */
  inputRef?: React.Ref<HTMLInputElement>
}

export const Input = ({
  onChange,
  disabled,
  inputType,
  icon,
  label,
  assistiveText,
  value,
  counterText,
  error,
  size,
  onClick,
  inputMode,
  showLabelAsPlaceHolder,
  hideDefaultBorder,
  autoSave,
  useAbsoluteForAssistiveText,
  required,
  defaultValue,
  autoFocus,
  autoComplete,
  fieldVariant,
  inputRef,
  ...rest
}: InputProps) => {
  const classes = inputBorderStyles()
  const {theme} = useBitThemeContext()

  return (
    <TextField
      {...rest}
      onChange={onChange}
      disabled={disabled}
      value={value}
      fullWidth
      required={required}
      autoFocus={autoFocus}
      inputMode={inputMode}
      autoComplete={autoComplete}
      error={error}
      inputRef={inputRef}
      defaultValue={defaultValue}
      placeholder={showLabelAsPlaceHolder ? label : ''}
      label={showLabelAsPlaceHolder ? '' : label}
      type={inputType}
      helperText={
        <span
          className={`helperText ${
            useAbsoluteForAssistiveText ? '' : 'resetPositionForText'
          }`}
        >
          <span>{assistiveText}</span>
          {counterText && (
            <span className={'counterText'}>{`${
              (value as string)?.length || 0
            }/${counterText}`}</span>
          )}
        </span>
      }
      InputProps={{
        endAdornment: icon && (
          <InputAdornment position='end'>
            <span
              data-testid='test-icon'
              onClick={() => {
                if (onClick) onClick()
              }}
              className={`${icon} ${size} icon ${
                (value as string)?.length >= 1 && 'filled'
              }`}
            ></span>
          </InputAdornment>
        ),
        className: `${fieldVariant}`
      }}
      className={`${disabled ? 'disabled' : null} ${size} ${
        icon ? 'iconRightPadding' : ''
      } ${autoSave && (value as string)?.length >= 1 ? 'autoSave' : ''} ${
        hideDefaultBorder ? classes.hideDefaultBorder : ''
      }`}
      sx={
        theme === 'light'
          ? stylesLightThemeInputStyles
          : stylesDarkThemeInputStyles
      }
    />
  )
}

Input.defaultProps = {
  assistiveText: ' ',
  size: InputSizes.MEDIUM,
  inputType: 'text',
  showLabelAsPlaceHolder: false,
  hideDefaultBorder: false,
  useAbsoluteForAssistiveText: true,
  theme: 'dark',
  fieldVariant: FieldVariants.OUTLINED
}
