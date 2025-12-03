import React from 'react'
import {Icons} from '../../icon/index'
import {
  ToggleButton,
  ToggleButtonType,
  ToggleButtonVariants
} from '../../toggle-button/index'
import {
  TableCellSeverity,
  TableCellSize,
  TableCellType,
  TcCell
} from '../tc-cell/index'
export type TcToggleButtonProps = {
  /**
   * To render the text inside the TableCell.
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
   * For deciding if a text-button or icon-button to be rendered
   */
  buttonType: ToggleButtonType
  /**
   * For providing onChange function(event: React.MouseEvent<HTMLElement>, value: string) => void
   */
  handleChange: (event: React.MouseEvent<HTMLElement>, value: string) => void
  /**
   * 	The currently selected value within the group
   */
  currentValue?: string
  /**
   * 	Array of object maxsize=2
   */
  list:
    | Array<{
        text: string
        value: string
        disabled?: boolean
        testIdentifier?: string
      }>
    | Array<{
        value: string
        icon: Icons
        disabled?: boolean
        testIdentifier?: string
      }>
  /**
   * 	For using different variants of toggle button
   */
  variant: ToggleButtonVariants
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcToggleButton(props: TcToggleButtonProps) {
  return (
    <TcCell
      theme={props.theme}
      size={props?.size}
      severity={props?.severity}
      stickyPosition={props?.stickyPosition}
      type={props?.type}
    >
      <ToggleButton
        theme={props.theme}
        list={props.list}
        handleChange={props.handleChange}
        buttonType={props.buttonType}
        currentValue={props.currentValue}
        variant={props.variant}
      />
    </TcCell>
  )
}
TcToggleButton.defaultProps = {
  theme: 'dark'
}
