import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {AnimationVariants, ShellVariant} from './constants'
import {ShellLoading} from './shell-loading'

export const BasicShellLoading = () => {
  return (
    <CompositionWrapper>
      <ShellLoading
        animation={AnimationVariants.WAVE}
        variant={ShellVariant.TEXT}
        width={80}
        height={80}
        testIdentifier={'shell-loading'}
      />
    </CompositionWrapper>
  )
}
