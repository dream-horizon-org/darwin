import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Checkbox} from './checkbox'
import {CheckboxStateList} from './constants'

export const BasicCheckbox = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = () => {
    setChecked(!checked)
  }
  return (
    <CompositionWrapper lists={{disabled: CheckboxStateList}}>
      <Checkbox
        checked={checked}
        name='checkbox'
        text={'BasicCheckbox'}
        onChange={handleChange}
      />
    </CompositionWrapper>
  )
}

BasicCheckbox.compositionName = 'Checkbox'
