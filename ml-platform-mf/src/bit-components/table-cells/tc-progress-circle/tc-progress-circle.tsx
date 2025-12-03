import React from 'react'
import {LoaderSize, ProgressCircle} from '../../progress-circle/index'
import {TableCellSize, TcCell} from '../tc-cell/index'
export type TcProgressCircleProps = {
  /**
   * To select the size of table cell
   */
  cellSize: TableCellSize
  /**
   * To select the size of loader
   */
  loaderSize: LoaderSize
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcProgressCircle({
  cellSize,
  loaderSize,
  stickyPosition,
  theme
}: TcProgressCircleProps) {
  return (
    <TcCell theme={theme} stickyPosition={stickyPosition} size={cellSize}>
      <ProgressCircle theme={theme} size={loaderSize} />
    </TcCell>
  )
}
TcProgressCircle.defaultProps = {
  theme: 'dark'
}
