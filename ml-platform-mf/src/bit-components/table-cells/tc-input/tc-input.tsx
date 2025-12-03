import React from 'react'
import {Icons} from '../../icon/index'
import {Input} from '../../input/index'
import {
  TableCellSeverity,
  TableCellSize,
  TableCellType,
  TcCell
} from '../tc-cell/index'
import {getInputSize} from './utils'
export type TcInputProps = {
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
   * onChange function to be provided.
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /**
   * Label content.
   */
  label: string
  /**
   * The value of the input element, required for a controlled component.
   */
  value: string
  /**
   * The name attribute specifies a name for an HTML element..
   */
  name: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * If true, the error state is enabled.
   */
  error?: boolean
  /**
   * Icon to be renderd at the end.
   */
  icon?: Icons
  /**
   * To render the helper text.
   */
  assistiveText?: string
  /**
   * To render the counter text.
   */
  counterText?: number
  /**
   * To define the label as a placeholder.
   */
  showLabelAsPlaceHolder?: boolean
  /**
   * To define the type of input .
   */
  inputType?: string
  /**
   * onClick function for the icon.
   */
  onClick?: () => void
  /**
   * Sticky position for the cell
   */
  stickyPosition?: 'left' | 'right'
  /**
   * To change theme
   */
  theme?: string
}

export function TcInput(props: TcInputProps) {
  return (
    <TcCell
      stickyPosition={props?.stickyPosition}
      size={props?.size}
      severity={props?.severity}
      type={props?.type}
      theme={props.theme}
    >
      <Input
        theme={props.theme}
        onChange={props.onChange}
        disabled={props.disabled}
        value={props.value}
        error={props.error}
        label={props.label}
        name={props.name}
        inputType={props.inputType}
        size={getInputSize(props?.size)}
        counterText={props.counterText}
        assistiveText={props.assistiveText}
        showLabelAsPlaceHolder={props.showLabelAsPlaceHolder}
        icon={props.icon}
      />
    </TcCell>
  )
}
TcInput.defaultProps = {
  theme: 'dark'
}
