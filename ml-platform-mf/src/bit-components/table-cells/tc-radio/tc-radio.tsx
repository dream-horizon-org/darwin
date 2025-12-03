import React from 'react'
import {Radio, RadioProps} from '../../radio/index'
import {
  TableCellSeverity,
  TableCellSize,
  TableCellType,
  TcCell
} from '../tc-cell/index'

export type TcRadioProps = RadioProps & {
  /**
   * Select size of data-cell
   */
  size?: TableCellSize
  /**
   * Select severity of data-cell
   */
  severity?: TableCellSeverity
  /**
   * Select type of data-cell
   */
  type?: TableCellType
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcRadio(props: TcRadioProps) {
  return (
    <TcCell
      stickyPosition={props?.stickyPosition}
      size={props?.size}
      severity={props?.severity}
      type={props?.type}
      theme={props?.theme}
    >
      <Radio
        theme={props?.theme}
        onChange={props?.onChange}
        text={props?.text}
        disabled={props?.disabled}
        value={props?.value}
        checked={props.checked}
      />
    </TcCell>
  )
}
TcRadio.defaultProps = {
  theme: 'dark'
}
