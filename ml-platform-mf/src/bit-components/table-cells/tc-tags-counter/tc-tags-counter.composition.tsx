import React from 'react'
import {CompositionWrapper} from '../../composition-wrapper/index'
import {TcTagsCounter} from './tc-tags-counter'

export const BasicTcTagsCounter = () => {
  return (
    <CompositionWrapper>
      <TcTagsCounter counter={0} />
    </CompositionWrapper>
  )
}
