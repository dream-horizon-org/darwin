import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TcHeader} from './tc-header'

export const BasicTcHeader = () => {
  return (
    <CompositionWrapper>
      <TcHeader />
    </CompositionWrapper>
  )
}

BasicTcHeader.compositionName = 'Tc Header'
