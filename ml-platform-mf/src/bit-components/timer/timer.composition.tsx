import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Timer} from './timer'

export const BasicTimer = () => {
  return (
    <CompositionWrapper>
      <Timer time={1000} testIdentifier={'timer'} />
    </CompositionWrapper>
  )
}

BasicTimer.compositionName = 'Timer'
