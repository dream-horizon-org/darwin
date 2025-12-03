import Button from '@mui/material/Button'
import React from 'react'
import {CompositionWrapper} from '../composition-wrapper/composition-wrapper'
import {ToolTipPlacement} from './constants'
import {Tooltip} from './tooltip'

export const BasicTooltip = () => {
  return (
    <CompositionWrapper>
      <Tooltip title='Text' placement={ToolTipPlacement.BottomStart}>
        <Button>Tool Tip Text</Button>
      </Tooltip>
    </CompositionWrapper>
  )
}
