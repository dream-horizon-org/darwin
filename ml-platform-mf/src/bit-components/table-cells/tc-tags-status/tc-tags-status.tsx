import React from 'react'
import {TagsStatus, TagsStatusTypes} from '../../tags/tags-status/index'
import {TooltipProp} from '../../tooltip/index'
import {TcCell} from '../tc-cell/index'
interface ToolProp extends Omit<TooltipProp, 'children'> {
  children?: React.ReactNode
}
export type TcTagsStatusProps = {
  /**
   * To render the status of tags.
   */
  status: TagsStatusTypes
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To render text
   */
  text?: String
  /**
   * To render text
   */
  hasTooltipWrapper?: boolean
  /**
   * To render text
   */
  tooltipProps?: ToolProp
  /**
   * To change theme
   */
  theme?: string
}

export function TcTagsStatus({
  status,
  tooltipProps,
  hasTooltipWrapper,
  stickyPosition,
  text,
  theme
}: TcTagsStatusProps) {
  return (
    <TcCell theme={theme} stickyPosition={stickyPosition}>
      <TagsStatus
        theme={theme}
        status={status}
        text={text}
        tooltipProps={tooltipProps}
        hasTooltipWrapper={hasTooltipWrapper}
      />
    </TcCell>
  )
}

TcTagsStatus.defaultProps = {
  hasTooltipWrapper: false,
  theme: 'dark'
}
