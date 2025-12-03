import React, {useState} from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TableCellSeverity, TableCellSize} from '../tc-cell/index'
import {TcRadio} from './tc-radio'

export const BasicTcRadio = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = () => {
    setChecked(true)
  }

  return (
    <CompositionWrapper>
      <TcRadio
        severity={TableCellSeverity.Default}
        size={TableCellSize.Large}
        checked={checked}
        value='test'
        text='Radio Button'
        onChange={handleChange}
      />
    </CompositionWrapper>
  )
}

BasicTcRadio.compositionName = 'Tc Radio'
