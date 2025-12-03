import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TableCellAlignment, TableCellSeverity} from './constants'
import {TcCell} from './tc-cell'

export const BasicTcCell = () => {
  return (
    <CompositionWrapper>
      <TcCell>
        <div>Hello World!</div>
      </TcCell>
    </CompositionWrapper>
  )
}

BasicTcCell.compositionName = 'Tc Cell'

export const SuccessTcCell = () => {
  return (
    <CompositionWrapper>
      <TcCell
        severity={TableCellSeverity.Success}
        align={TableCellAlignment.Right}
      >
        <div>Hello World!</div>
      </TcCell>
    </CompositionWrapper>
  )
}
