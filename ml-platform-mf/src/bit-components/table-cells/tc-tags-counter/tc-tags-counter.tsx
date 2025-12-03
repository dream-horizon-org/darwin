import React from 'react'
import {TagsCounter} from '../../tags/tags-counter/index'
import {TcCell} from '../tc-cell/index'
export type TcTagsCounterProps = {
  /**
   * To set count inside the counter. Only numbers
   */
  counter: number
  /**
   * To disable the number.
   */
  disabled?: boolean
  /**
   * To show the active state inside the counter
   */
  active?: boolean
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcTagsCounter({
  counter,
  active,
  disabled,
  stickyPosition,
  theme
}: TcTagsCounterProps) {
  return (
    <TcCell theme={theme} stickyPosition={stickyPosition}>
      <TagsCounter
        theme={theme}
        counter={counter}
        active={active}
        disabled={disabled}
      />
    </TcCell>
  )
}
TcTagsCounter.defaultProps = {
  theme: 'dark'
}
