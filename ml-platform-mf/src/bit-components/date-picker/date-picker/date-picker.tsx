import TextField from '@mui/material/TextField'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {DatePicker as MaterialUiDatePicker} from '@mui/x-date-pickers/DatePicker'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import React, {useEffect, useState} from 'react'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {
  datePickerDarkStyle,
  datePickerPoperDarkStyle
} from './styles/darkThemeStyles'
import {
  datePickerLightStyle,
  datePickerPoperLightStyle
} from './styles/lightThemeStyles'
export type DatePickerProps = {
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
   * 	Format to be appear on the picker.
   */
  format?: string
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * To change theme
   */
  theme?: string
  /**
   * If true, the input element is required.
   */
  required?: boolean
  /**
   * no border on date time.
   */
  noBorder?: boolean
  /**
   * To disable the keyboard input.
   */
  disableKeybordInput?: boolean
  /**
   * To show error
   */
  error?: boolean
  /**
   * To show error message or helper Text
   */
  assistiveText?: string
  /**
   * No blinking cursor
   */
  noBlinkingCursor?: boolean
  /**
   * Edit Icon on calender
   */
  editMode?: boolean
  /**
   * To close on select or not
   */
  closeOnSelect?: boolean
  /**
   * On accept handler
   */
  onAccept?: ((value: Date | null) => void) | undefined
  /**
   * Enable action button in popup
   */
  enableActionButtons?: boolean
  /**
   * size of the date picker
   */
  size?: 'medium' | 'small'
}

export function DatePicker(props: DatePickerProps) {
  const {
    onChange,
    label,
    disabled,
    disablePast,
    format,
    maxDate,
    minDate,
    testIdentifier,
    value,
    required,
    disableFuture,
    disableKeybordInput,
    error,
    assistiveText,
    noBorder,
    noBlinkingCursor,
    editMode,
    closeOnSelect,
    onAccept,
    enableActionButtons,
    size
  } = props
  const [date, setDate] = useState<Date | null>(null)
  const handleChange = (newValue: Date | null) => {
    setDate(newValue)
    onChange(newValue)
  }
  useEffect(() => {
    setDate(value)
  }, [value])

  const dark = datePickerDarkStyle()
  const light = datePickerLightStyle()
  const {theme} = useBitThemeContext()
  const styles = theme === 'dark' ? dark : light

  const darkPaper = datePickerPoperDarkStyle()
  const lightPaper = datePickerPoperLightStyle()
  const stylesPaper = theme === 'dark' ? darkPaper : lightPaper

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MaterialUiDatePicker
        label={label}
        value={date}
        components={{
          OpenPickerIcon: editMode ? EditOutlinedIcon : InsertInvitationIcon
        }}
        componentsProps={
          enableActionButtons
            ? {
                switchViewButton: {
                  children: ['Cancel', 'Accept']
                }
              }
            : {}
        }
        onAccept={onAccept}
        onClose={() => closeOnSelect}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            sx={styles}
            {...params}
            className={`${size} ${noBorder ? 'noBorder' : null} ${
              noBlinkingCursor ? 'noBlinkingCursor' : null
            }`}
            required={required}
            data-testid={testIdentifier}
            data-test={testIdentifier}
            error={error}
            label={label}
            helperText={<span className={`helperText`}>{assistiveText}</span>}
          />
        )}
        disablePast={disablePast}
        disableFuture={disableFuture}
        disabled={disabled}
        inputFormat={format || 'dd/MM/yyyy'}
        maxDate={maxDate}
        minDate={minDate}
        PaperProps={{sx: stylesPaper}}
        InputProps={
          disableKeybordInput ? {onKeyDown: (e) => e.preventDefault()} : {}
        }
      />
    </LocalizationProvider>
  )
}
DatePicker.defaultProps = {
  theme: 'dark',
  closeOnSelect: true
}
