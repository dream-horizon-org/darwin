import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {Icons} from '../../icon/index'
import {TcButton} from './tc-button'

export const BasicTcButton = () => {
  const onClick = () => {}
  return (
    <CompositionWrapper>
      <TcButton
        buttonText={'button'}
        onClick={onClick}
        leadingIcon={Icons.ICON_HIGHLIGHT_OFF}
      />
    </CompositionWrapper>
  )
}
