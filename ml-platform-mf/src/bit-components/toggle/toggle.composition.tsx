import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'
import {ToggleStateList} from './constants'
import {Toggle} from './toggle'

export const BasicToggle = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = (e) => {
    setChecked(e.target.checked)
  }
  return (
    <CompositionWrapper lists={{disabled: ToggleStateList}}>
      <Toggle checked={checked} value='test' onChange={handleChange} />
    </CompositionWrapper>
  )
}
BasicToggle.compositionName = 'Toggle'
