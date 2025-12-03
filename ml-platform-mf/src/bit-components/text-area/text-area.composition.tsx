import React, {useState} from 'react'
import {TextAreaSizeList, TextAreaStateList} from './constants'
import {TextArea} from './text-area'

import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'

export const Default = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <CompositionWrapper
      lists={{size: TextAreaSizeList, disabled: TextAreaStateList}}
      component={(prop) => (
        <TextArea
          label='Label'
          name='TextArea'
          value={value}
          onChange={handleChange}
          {...prop}
        />
      )}
    ></CompositionWrapper>
  )
}

export const Error = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <CompositionWrapper
      lists={{size: TextAreaSizeList, disabled: TextAreaStateList}}
      component={(prop) => (
        <TextArea
          label='Label'
          name='TextArea'
          value={value}
          onChange={handleChange}
          assistiveText='Value should be less than 5'
          error={value.length > 5}
          {...prop}
        />
      )}
    />
  )
}

export const ErrorWithCounterText = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <CompositionWrapper
      lists={{size: TextAreaSizeList, disabled: TextAreaStateList}}
      component={(prop) => (
        <TextArea
          label='Label'
          name='TextArea'
          value={value}
          onChange={handleChange}
          counterText={50}
          assistiveText='Value should be less than 5'
          error={value.length > 5}
          {...prop}
        />
      )}
    />
  )
}
