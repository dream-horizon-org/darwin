import React, {useState} from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {TableCellSize} from '../tc-cell/index'
import {TcInput} from './tc-input'

export const LargeTcInput = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  return (
    <CompositionWrapper>
      <TcInput
        size={TableCellSize.Large}
        label={'Label'}
        name={'Input'}
        value={value}
        onChange={handleChange}
        icon={Icons.ICON_INFORMATION}
      />
    </CompositionWrapper>
  )
}

export const SmallTcInput = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  return (
    <CompositionWrapper>
      <TcInput
        size={TableCellSize.Small}
        label={'Label'}
        name={'Input'}
        value={value}
        onChange={handleChange}
      />
    </CompositionWrapper>
  )
}
