import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {DividerAlignmentList, DividerTypeList} from './constant'
import {Divider} from './divider'

export const BasicDivider = () => {
  return (
    <CompositionWrapper
      lists={{type: DividerTypeList, alignment: DividerAlignmentList}}
      parentStyle={{
        height: '100%'
      }}
    >
      <Divider />
    </CompositionWrapper>
  )
}
BasicDivider.compositionName = 'Divider'
