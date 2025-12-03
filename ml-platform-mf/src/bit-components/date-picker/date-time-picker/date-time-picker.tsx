import TextField from '@mui/material/TextField'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {DateTimePicker as MaterialUiDateTimePicker} from '@mui/x-date-pickers/DateTimePicker'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import React, {useEffect, useState} from 'react'

import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {
  dateTimePickerDarkStyle,
  dateTimePickerPoperDarkStyle
} from './styles/darkThemeStyles'
import {
  dateTimePickerLightStyle,
  dateTimePickerPoperLightStyle
} from './styles/lightThemeStyles'

export type DateTimePickerProps = {
  /**
   * Callback fired when the value (the selected date) changes.
   */
  onChange: (newValue: Date | null) => void
  /**
   * The value of the provided to the picker.
   */
  value: Date | null
  /**
   * Label content.
   */
  label?: string
  /**
   * If true picker is disabled.
   */
  disabled?: boolean
  /**
   * 	If true past days are disabled.
   */
  disablePast?: boolean
  /**
   * 	If true future days are disabled.
   */
  disableFuture?: boolean
  /**
   * 	Maximal selectable date.
   */
  maxDate?: Date
  /**
   * 	Minimal selectable date.
   */
  minDate?: Date
  /**
   * 	Format to be appear on the picker, for ex-> "yyyy-MM-dd' 'hh:mm:ss" ,"MM-dd-yyyy' 'hh:mm:ss","dd-MM-yyyy' 'hh:mm:ss"
   */
  format?: string
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * 	12h/24h view for hour selection clock.
   */
  ampm?: boolean
  /**
   * 	Max acceptable time.
   */
  maxTime?: string
  /**
   * 	Min acceptable time.
   */
  minTime?: string
  /**
   * 	Max acceptable date time.
   */
  maxDateTime?: Date
  /**
   * 	Min acceptable date time.
   */
  minDateTime?: Date
  /**
   * no border on date time.
   */
  noBorder?: boolean
  /**
   * 	To change theme
   */
  theme?: string
  /**
   * If true, the input element is required.
   */
  required?: boolean
  /**
   * To set the autofocus
   */
  autoFocus?: boolean
  /**
   * To turn on and off the autofocus
   */
  autoComplete?: string
  /**
   * To define the label as a placeholder.
   */
  showLabelAsPlaceHolder?: boolean
  /**
   * To disable the keyboard input.
   */
  disableKeybordInput?: boolean
  /**
   * Show now placeholder.
   */
  showNow?: boolean
  /**
   * To show error
   */
  error?: boolean
  /**
   * To show error message or helper Text
   */
  assistiveText?: string
  /**
   * For Input Ref
   */
  inputRef?: React.Ref<HTMLInputElement>
  /**
   * No blinking cursor
   */
  noBlinkingCursor?: boolean
}

const dark = dateTimePickerDarkStyle()
const light = dateTimePickerLightStyle()

export function DateTimePicker(props: DateTimePickerProps) {
  const {
    onChange,
    label,
    disabled,
    disablePast,
    disableFuture,
    maxDate,
    minDate,
    required,
    testIdentifier,
    value,
    ampm,
    format,
    autoComplete,
    autoFocus,
    showLabelAsPlaceHolder,
    disableKeybordInput,
    showNow,
    error,
    assistiveText,
    inputRef,
    maxDateTime,
    minDateTime,
    noBorder,
    noBlinkingCursor
  } = props
  const [date, setDate] = useState<Date | null>(null)
  const handleChange = (data: Date | null) => {
    setDate(data)
    onChange(data)
  }
  useEffect(() => {
    setDate(value)
  }, [value])

  const {theme} = useBitThemeContext()
  const styles = theme === 'dark' ? dark : light

  const darkPaper = dateTimePickerPoperDarkStyle()
  const lightPaper = dateTimePickerPoperLightStyle()
  const stylesPaper = theme === 'dark' ? darkPaper : lightPaper

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MaterialUiDateTimePicker
        renderInput={(params) => (
          <TextField
            {...params}
            sx={styles}
            required={required}
            className={`medium ${noBorder ? 'noBorder' : null} ${
              noBlinkingCursor ? 'noBlinkingCursor' : null
            }`}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            inputProps={{
              ...params.inputProps,
              placeholder: showNow ? 'Now' : label
            }}
            data-testid={testIdentifier}
            error={error}
            placeholder={showLabelAsPlaceHolder ? label : ''}
            label={showLabelAsPlaceHolder ? '' : label}
            helperText={<span className={`helperText`}>{assistiveText}</span>}
            InputProps={
              showNow
                ? {
                    ...params.InputProps,
                    classes: {
                      input: 'placeholderStyles'
                    }
                  }
                : {...params.InputProps}
            }
          />
        )}
        label={label}
        value={date}
        onChange={handleChange}
        disablePast={disablePast}
        disableFuture={disableFuture}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        maxDateTime={maxDateTime}
        minDateTime={minDateTime}
        ampm={ampm}
        inputRef={inputRef}
        PaperProps={{
          sx: stylesPaper
        }}
        inputFormat={format || "dd-MM-yyyy' 'hh:mm:ss"}
        InputProps={
          disableKeybordInput ? {onKeyDown: (e) => e.preventDefault()} : {}
        }
      />
    </LocalizationProvider>
  )
}
DateTimePicker.defaultProps = {
  ampm: true,
  theme: 'dark',
  showLabelAsPlaceHolder: false,
  showNow: false
}
