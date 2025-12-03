import React from 'react'
import {LoaderSize, LoaderSizeList} from './constants'
import {ProgressCircle} from './progress-circle'

import {CompositionWrapper} from '../composition-wrapper/index'
export const LargeProgressCircle = () => {
  return (
    <CompositionWrapper lists={{size: LoaderSizeList}}>
      <ProgressCircle size={LoaderSize.Large} />
    </CompositionWrapper>
  )
}
