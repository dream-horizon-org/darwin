import {createUseStyles} from 'react-jss'
import {divider as dividerTheme} from '../../design-tokens/index'

const divider = dividerTheme('light')
export const stylesLightTheme = createUseStyles({
  divider: {
    '&.horizontal': {
      '&.dashed': {
        '&.default': {
          borderTop: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_dashed} ${divider.divider.ds_divider_border_generic_color}`
        },
        '&.generic': {
          borderTop: `${divider.ds_divider_horizontal_border_weight}px  ${divider.border_style.ds_divider_horizontal_border_dashed} ${divider.divider.ds_divider_border_generic_color}`
        }
      },
      '&.solid': {
        '&.default': {
          borderTop: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_solid}  ${divider.divider.ds_divider_border_generic_color}`
        },
        '&.generic': {
          borderTop: `${divider.ds_divider_horizontal_border_weight}px ${divider.border_style.ds_divider_horizontal_border_solid}  ${divider.divider.ds_divider_border_generic_color}`
        }
      }
    },
    '&.vertical': {
      '&.dashed': {
        '&.default': {
          borderLeft: `${divider.ds_divider_vertical_border_weight}px  ${divider.border_style.ds_divider_vertical_border_dashed} ${divider.divider.ds_divider_border_generic_color}`
        },
        '&.generic': {
          borderLeft: `${divider.ds_divider_vertical_border_weight}px ${divider.border_style.ds_divider_vertical_border_dashed}  ${divider.divider.ds_divider_border_generic_color}`
        },
        height: '100%',
        border: 'none',
        display: 'inlineBlock',
        margin: '0px'
      },
      '&.solid': {
        '&.default': {
          borderLeft: `${divider.ds_divider_vertical_border_weight}px ${divider.border_style.ds_divider_vertical_border_solid}  ${divider.divider.ds_divider_border_generic_color}`
        },
        '&.generic': {
          borderLeft: `${divider.ds_divider_vertical_border_weight}px ${divider.border_style.ds_divider_vertical_border_solid}  ${divider.divider.ds_divider_border_generic_color}`
        },
        border: 'none',
        height: '100%',
        display: 'inlineBlock',
        margin: '0px'
      }
    }
  }
})
