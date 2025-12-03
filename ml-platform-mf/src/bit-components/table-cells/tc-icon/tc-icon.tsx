import React from 'react'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton
} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {
  TableCellSeverity,
  TableCellSize,
  TableCellType,
  TcCell
} from '../tc-cell/index'

export type TcIconProps = {
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
   * onClick function to be provided.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * Need to be provied to render icon .
   */
  leadingIcon: Icons
  /**
   * For defining the selected state, of the button (only works when the actionable is true)
   */
  isSelected?: boolean
  /**
   * For providing sub variants for actionableButton (only works when the actionable is true)
   */
  actionableVariants?: ActionableIconButtonVariants
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcIcon(props: TcIconProps) {
  return (
    <TcCell
      stickyPosition={props?.stickyPosition}
      size={props?.size}
      severity={props?.severity}
      type={props?.type}
      theme={props.theme}
    >
      <IconButton
        theme={props.theme}
        onClick={props.onClick}
        leadingIcon={props.leadingIcon}
        isSelected={props.isSelected}
        disabled={props.disabled}
        actionableSizes={ActionableIconButtonSizes.SMALL}
        actionable={true}
        actionableVariants={props.actionableVariants}
      />
    </TcCell>
  )
}
TcIcon.defaultProps = {
  theme: 'dark'
}
