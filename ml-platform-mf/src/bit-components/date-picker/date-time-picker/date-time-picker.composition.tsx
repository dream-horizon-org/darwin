import React, {useState} from 'react'
import {DateTimePicker} from './date-time-picker'

import {CompositionWrapper} from '../../composition-wrapper/index'

export const BasicDateTimePicker = () => {
  const [value, setValue] = useState<Date | null>(null)
  const handleChange = (data) => {
    setValue(data)
  }
  return (
    <CompositionWrapper>
      <DateTimePicker
        onChange={handleChange}
        value={value}
        label='Date Time Picker'
        testIdentifier={'dateTimePicker-1'}
      />
    </CompositionWrapper>
  )
}
BasicDateTimePicker.compositionName = 'Date Time Picker'
