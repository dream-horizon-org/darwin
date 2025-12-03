import React from 'react'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes,
  IconButtonVariants
} from '../../icon-button/index'
import {Icons} from '../../icon/index'
import {ToolTipPlacement} from '../../tooltip/index'
import {
  TableCellSeverity,
  TableCellSize,
  TableCellType,
  TcCell
} from '../tc-cell/index'
export type TcIconButtonProps = {
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
   * Select size of icon-button
   */
  buttonSize?: IconButtonSizes
  /**
   * onClick function to be provided.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * Need to be provied to render icon .
   */
  leadingIcon: Icons
  /**
   * Need to be provied to change compoenent variant .
   */
  variant?: IconButtonVariants
  /**
   * For selecting a new variant , which has its own sub variants.
   */
  actionable?: boolean
  /**
   * For defining the selected state, of the button (only works when the actionable is true)
   */
  isSelected?: boolean
  /**
   * For providing sub variants for actionableButton (only works when the actionable is true)
   */
  actionableVariants?: ActionableIconButtonVariants
  /**
   * For providing different variants for actionableButton (only works when the actionable is true)
   */
  actionableSizes?: ActionableIconButtonSizes
  /**
   * To provide test Id to icon button
   */
  dataTestId?: string
  /**
   * To Provide loading state in icon
   */
  isLoading?: boolean
  /**
   * To change theme
   */
  theme?: string
  /**
   * To Provide tooltip
   */
  showToolTip?: boolean
  /**
   * To Provide tooltip Text
   */
  toolTipText?: string
  /**
   * To Provide tooltip position
   */
  toolTipPlacement?: ToolTipPlacement
  /**
   * Disable Tooltip on hover
   */
  disabletoolTipHoverListener?: boolean
  /* Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
}

export function TcIconButton(props: TcIconButtonProps) {
  const {
    size,
    severity,
    type,
    disabled,
    leadingIcon,
    variant,
    actionable,
    isSelected,
    actionableVariants,
    actionableSizes,
    dataTestId,
    isLoading,
    buttonSize,
    onClick,
    theme,
    showToolTip,
    toolTipText,
    toolTipPlacement,
    disabletoolTipHoverListener,
    stickyPosition
  } = props

  const onElementClick = (event) => {
    event.stopPropagation()
    if (onClick && !disabled) {
      onClick(event)
    }
  }

  return (
    <TcCell
      theme={theme}
      size={size}
      severity={severity}
      type={type}
      stickyPosition={stickyPosition}
    >
      <IconButton
        theme={theme}
        leadingIcon={leadingIcon}
        onClick={onElementClick}
        variant={variant}
        actionableVariants={actionableVariants}
        actionableSizes={actionableSizes}
        actionable={actionable}
        disabled={disabled}
        size={buttonSize}
        isSelected={isSelected}
        dataTestId={dataTestId}
        isLoading={isLoading}
        showToolTip={showToolTip}
        toolTipText={toolTipText}
        toolTipPlacement={toolTipPlacement}
        disabletoolTipHoverListener={disabletoolTipHoverListener}
      />
    </TcCell>
  )
}
TcIconButton.defaultProps = {
  theme: 'dark'
}
