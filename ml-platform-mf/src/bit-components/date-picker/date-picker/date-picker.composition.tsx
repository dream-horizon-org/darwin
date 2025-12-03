import React, {useState} from 'react'
import {DatePicker} from './date-picker'

import {CompositionWrapper} from '../../composition-wrapper/index'
export const BasicDatePicker = () => {
  const [value, setValue] = useState<Date | null>(
    new Date('Mon Jul 11 2022 14:46:06 GMT+0530')
  )
  const handleChange = (data) => {
    setValue(data)
  }
  return (
    <CompositionWrapper>
      <DatePicker
        label={'Date picker'}
        onChange={handleChange}
        value={value}
        testIdentifier={'datePicker-1'}
      />
    </CompositionWrapper>
  )
}

BasicDatePicker.compositionName = 'Date Picker'
