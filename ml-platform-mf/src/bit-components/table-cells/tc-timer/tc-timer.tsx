import React from 'react'
import {Timer} from '../../timer/index'
import {TcCell, TcCellProps} from '../tc-cell/index'

export interface TcTimerProps extends TcCellProps {
  /**
   * Time to be give to start a counter (hh:mm:ss)
   */
  time: number | null
  /**
   *
   */
  testIdentifier?: string
  /**
   * To change theme
   */
  theme?: string
}

export function TcTimer({
  time,
  size,
  align,
  severity,
  stickyPosition,
  type,
  testIdentifier,
  theme
}: TcTimerProps) {
  return (
    <TcCell
      theme={theme}
      severity={severity}
      stickyPosition={stickyPosition}
      type={type}
      size={size}
      align={align}
    >
      <Timer theme={theme} time={time} testIdentifier={testIdentifier} />
    </TcCell>
  )
}
