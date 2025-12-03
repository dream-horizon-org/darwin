import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TcShellLoading} from './tc-shell-loading'

export const BasicTcShellLoading = () => {
  return (
    <CompositionWrapper>
      <TcShellLoading testIdentifier='shell-loading' />
    </CompositionWrapper>
  )
}
BasicTcShellLoading.compositionName = 'Tc Shell Loading'
