import TextField from '@mui/material/TextField'
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns'
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import {TimePicker as MaterialUTimePicker} from '@mui/x-date-pickers/TimePicker'
import React, {useEffect, useState} from 'react'

import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {
  timePickerDarkStyle,
  timePickerPoperDarkStyle
} from './styles/darkThemeStyles'
import {
  timePickerLightStyle,
  timePickerPoperLightStyle
} from './styles/lightThemeStyles'
export type TimePickerProps = {
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
   * 	12h/24h view for hour selection clock.
   */
  ampm?: boolean
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  maxTime?: Date
  minTime?: Date
  /**
   * To change theme.
   */
  theme?: string
}

export function TimePicker(props: TimePickerProps) {
  const {
    onChange,
    label,
    disabled,
    ampm,
    testIdentifier,
    value,
    maxTime,
    minTime
  } = props
  const [time, setTime] = useState<Date | null>(null)
  const handleChange = (newValue: Date | null) => {
    setTime(newValue)
    onChange(newValue)
  }
  useEffect(() => {
    setTime(value)
  }, [value])

  const {theme} = useBitThemeContext()

  const dark = timePickerDarkStyle()
  const light = timePickerLightStyle()
  const styles = theme === 'dark' ? dark : light

  const darkPaper = timePickerPoperDarkStyle()
  const lightPaper = timePickerPoperLightStyle()
  const stylesPaper = theme === 'dark' ? darkPaper : lightPaper

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MaterialUTimePicker
        label={label}
        value={time}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField {...params} sx={styles} className='medium' />
        )}
        disabled={disabled}
        data-test={testIdentifier}
        ampm={ampm}
        PaperProps={{
          sx: stylesPaper
        }}
        maxTime={maxTime}
        minTime={minTime}
      />
    </LocalizationProvider>
  )
}
TimePicker.defaultProps = {
  ampm: true,
  theme: 'dark'
}
