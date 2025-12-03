import React from 'react'
import {
  Button,
  ButtonAriaHasPopup,
  ButtonTypes,
  ButtonVariants
} from '../../button/index'
import {Icons} from '../../icon/index'
import {TableCellSeverity, TableCellSize, TcCell} from '../tc-cell/index'
import {getInputSize} from './utils'
export type TcButtonProps = {
  /**
   * To set the size of data cell
   */
  size?: TableCellSize
  /**
   * To set the severity of data cell
   */
  severity?: TableCellSeverity
  /**
   * onClick function to be provided.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Button text to be rendered.
   */
  buttonText: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * Icon placed after the text.
   */
  trailingIcon?: Icons
  /**
   * Icon placed before the text.
   */
  leadingIcon?: Icons
  /**
   * To give the button type.
   */
  type?: ButtonTypes
  /**
   * To be used an identifier for testing.
   */
  testIdentifier?: string
  /**
   * The label for the Button as a string.
   */
  ariaControl?: string
  /**
   * The ariaHasPopup attribute indicates the availability and type of interactive popup element.
   */
  ariaHasPopup?: ButtonAriaHasPopup
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
  /**
   * To change button variant
   */
  variant?: ButtonVariants
}

export function TcButton(props: TcButtonProps) {
  const {
    onClick,
    size,
    severity,
    buttonText,
    disabled,
    trailingIcon,
    leadingIcon,
    type,
    testIdentifier,
    ariaControl,
    ariaHasPopup,
    stickyPosition,
    theme,
    variant
  } = props
  return (
    <TcCell
      theme={theme}
      stickyPosition={stickyPosition}
      size={size}
      severity={severity}
    >
      <Button
        size={getInputSize(size)}
        onClick={onClick}
        buttonText={buttonText}
        variant={variant}
        disabled={disabled}
        trailingIcon={trailingIcon}
        leadingIcon={leadingIcon}
        type={type}
        testIdentifier={testIdentifier}
        ariaControl={ariaControl}
        ariaHasPopup={ariaHasPopup}
        theme={theme}
      />
    </TcCell>
  )
}
TcButton.defaultProps = {
  theme: 'dark',
  size: TableCellSize.Small,
  severity: TableCellSeverity.Default,
  variant: ButtonVariants.SECONDARY
}
