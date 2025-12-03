import {styled} from '@mui/material/styles'
import MUITooltip, {tooltipClasses, TooltipProps} from '@mui/material/Tooltip'
import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/bit-theme-wrapper.context'
import {ToolTipPlacement} from './constants'
import {
  tooltipDarkThemeArrow,
  tooltipDarkThemeTypography
} from './styles/darkThemeStyles'
import {
  tooltipLightThemeArrow,
  tooltipLightThemeTypography
} from './styles/lightThemeStyles'

export type TooltipProp = {
  children: React.ReactElement<any, any> & ReactNode
  title: NonNullable<ReactNode>
  placement?: ToolTipPlacement
  disableHoverListener?: boolean
  theme?: string
  options?: object
}
//

export function Tooltip(props: TooltipProp) {
  const {children, title, placement, disableHoverListener, options = {}} = props
  const {theme} = useBitThemeContext()
  const CustomizedTooltip = styled(({className, ...prop}: TooltipProps) => (
    <MUITooltip {...prop} arrow classes={{popper: className}} />
  ))(() => ({
    [`& .${tooltipClasses.arrow}`]:
      theme === 'dark' ? tooltipDarkThemeArrow : tooltipLightThemeArrow,

    [`& .${tooltipClasses.tooltip}`]:
      theme === 'dark'
        ? tooltipDarkThemeTypography
        : tooltipLightThemeTypography
  }))
  return (
    <CustomizedTooltip
      placement={placement}
      disableFocusListener
      disableHoverListener={disableHoverListener}
      disableTouchListener
      title={title}
      PopperProps={{style: {zIndex: 1200}}}
      {...options}
    >
      {children}
    </CustomizedTooltip>
  )
}
Tooltip.defaultProps = {
  theme: 'dark'
}
