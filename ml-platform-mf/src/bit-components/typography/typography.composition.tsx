import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'
import {Typography} from './typography'

export const BasicTypography = () => {
  return (
    <CompositionWrapper>
      <Typography>Hello world!</Typography>
    </CompositionWrapper>
  )
}
BasicTypography.compositionName = 'Typography'
