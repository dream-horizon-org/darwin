import React, {useState} from 'react'
import {TimePicker} from './time-picker'

import {CompositionWrapper} from '../../composition-wrapper/index'

export const BasicTimePicker = () => {
  const [value, setValue] = useState<Date | null>(null)
  const handleChange = (data) => {
    setValue(data)
  }
  return (
    <CompositionWrapper>
      <TimePicker
        label={'Time picker'}
        onChange={handleChange}
        value={value}
        testIdentifier={'timePicker-1'}
      />
    </CompositionWrapper>
  )
}
BasicTimePicker.compositionName = 'Time Picker'

export const TimePicker24Hrs = () => {
  const [value, setValue] = useState<Date | null>(null)
  const handleChange = (data) => {
    setValue(data)
  }
  return (
    <CompositionWrapper>
      <TimePicker
        label={'Time picker'}
        onChange={handleChange}
        value={value}
        ampm={false}
        testIdentifier={'timePicker-1'}
      />
    </CompositionWrapper>
  )
}

TimePicker24Hrs.compositionName = '24 hrs time picker'
