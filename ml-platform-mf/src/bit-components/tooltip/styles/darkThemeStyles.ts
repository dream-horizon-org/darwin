import {tooltip as tooltipTheme} from '../../design-tokens/index'
const tooltip = tooltipTheme('dark')

export const tooltipDarkThemeTypography = {
  backgroundColor: tooltip.tooltip.background.ds_tooltip_background_color,
  display: 'flex',
  alignItems: 'center',
  minHeight: '16px',
  fontSize: '12px',
  fontWeight: '400',
  padding: `${tooltip.ds_tooltip_vertical_spacing}px ${tooltip.ds_tooltip_horizontal_spacing}px`,
  color: tooltip.tooltip.text.ds_tooltip_background_color_copy
}

export const tooltipDarkThemeArrow = {
  color: tooltip.tooltip.background.ds_tooltip_background_color
}
