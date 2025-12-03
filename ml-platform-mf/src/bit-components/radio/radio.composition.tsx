import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {RadioStateList} from './constants'
import {Radio} from './radio'

export const BasicRadio = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = () => {
    setChecked((pre) => !pre)
  }
  return (
    <CompositionWrapper lists={{disabled: RadioStateList}}>
      <Radio
        checked={checked}
        value='test'
        text='Radio Button'
        onChange={handleChange}
      />
    </CompositionWrapper>
  )
}

BasicRadio.compositionName = 'Radio'
export const SelectedRadio = () => {
  const [checked, setChecked] = useState(true)
  const handleChange = () => {
    setChecked((pre) => !pre)
  }
  return (
    <CompositionWrapper lists={{disabled: RadioStateList}}>
      <Radio
        checked={checked}
        value='test'
        text='Radio Button'
        onChange={handleChange}
      />
    </CompositionWrapper>
  )
}

export const WithNoText = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = () => {
    setChecked((pre) => !pre)
  }
  return (
    <CompositionWrapper lists={{disabled: RadioStateList}}>
      <Radio checked={checked} value='test' onChange={handleChange} />
    </CompositionWrapper>
  )
}

export const SelectedRadioNoText = () => {
  const [checked, setChecked] = useState(true)
  const handleChange = () => {
    setChecked((pre) => !pre)
  }
  return (
    <CompositionWrapper lists={{disabled: RadioStateList}}>
      <Radio checked={checked} value='test' onChange={handleChange} />
    </CompositionWrapper>
  )
}
