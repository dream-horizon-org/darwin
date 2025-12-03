import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'
import {TagsStatusTypes} from '../tags/tags-status/constants'
import {ToolTipPlacement} from '../tooltip/index'
import {TcTagsStatus} from './tc-tags-status'

export const BasicTcTagsStatus = () => {
  return (
    <CompositionWrapper>
      <TcTagsStatus status={TagsStatusTypes.Active} />
    </CompositionWrapper>
  )
}
BasicTcTagsStatus.compositionName = 'Tc Tags Status'

export const TcTagsStatusWithTooltip = () => {
  return (
    <CompositionWrapper>
      <TcTagsStatus
        status={TagsStatusTypes.Active}
        hasTooltipWrapper={true}
        tooltipProps={{
          title: 'Test 12',
          placement: ToolTipPlacement.Bottom
        }}
      />
    </CompositionWrapper>
  )
}
