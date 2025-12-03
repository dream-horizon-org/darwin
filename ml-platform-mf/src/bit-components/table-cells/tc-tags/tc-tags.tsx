import React from 'react'
import {Icons} from '../../icon/index'
import {Tags, TagsSizes, TagsType} from '../../tags/tags/index'
import {TableCellSeverity, TableCellSize, TcCell} from '../tc-cell/index'

export type TcTagsProps = {
  /**
   * To set message inside the  tags
   */
  label: string
  /**
   * Select the type of tags
   */
  type?: TagsType
  /**
   * To set icon inside the tags.
   */
  trailingIcon?: Icons
  /**
   * To set the size of data cell
   */
  size?: TableCellSize
  /**
   * To set the severity of data cell
   */
  severity?: TableCellSeverity
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcTags({
  label,
  type,
  trailingIcon,
  size,
  severity,
  stickyPosition,
  theme
}: TcTagsProps) {
  return (
    <TcCell
      theme={theme}
      size={size}
      stickyPosition={stickyPosition}
      severity={severity}
    >
      <Tags
        theme={theme}
        label={label}
        size={TagsSizes.Small}
        type={type}
        trailingIcon={trailingIcon}
      />
    </TcCell>
  )
}
TcTags.defaultProps = {
  size: TableCellSize.Small,
  severity: TableCellSeverity.Default,
  theme: 'dark'
}
