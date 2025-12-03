import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TcTimer} from './tc-timer'

export const BasicTcTimer = () => {
  return (
    <CompositionWrapper>
      <TcTimer time={100} testIdentifier={'timer'} />
    </CompositionWrapper>
  )
}
BasicTcTimer.compositionName = 'Tc Timer'

export const BasicTcTimerWithZeroTimer = () => {
  return (
    <CompositionWrapper>
      <TcTimer time={0} testIdentifier={'timer'} />
    </CompositionWrapper>
  )
}
BasicTcTimerWithZeroTimer.compositionName = 'Tc Timer + 0'
