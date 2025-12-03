import {SxProps} from '@mui/material'
import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

import {
  divider,
  dropdown_list,
  input_field,
  typography
} from '../../../bit-components/design-tokens/index'
import {Typography} from '../../../themes'

export const inputStyles: SxProps = {
  '& .MuiAutocomplete-popper': {
    background: 'rgba(51, 51, 51, 0.9)',
    '& >div': {
      background: 'rgba(51, 51, 51, 0.9)'
    }
  },
  '& .MuiAutocomplete-clearIndicator': {
    borderRight: `${divider('dark').ds_divider_vertical_border_weight}px ${
      divider('dark').border_style.ds_divider_vertical_border_solid
    }  ${divider('dark').divider.ds_divider_border_generic_color}`,
    borderRadius: '0px',
    marginRight: `${
      dropdown_list('dark').ds_dropdown_list_item_leading_icon_right_spacing
    }px`,
    paddingRight: `${
      dropdown_list('dark').ds_dropdown_list_item_leading_icon_right_spacing
    }px`
  },

  '&.MuiTextField-root': {
    height: 'fit-content'
  },
  '& .MuiSvgIcon-root': {
    color: '#8F8F8F'
  },

  '& .MuiInputLabel': {
    '&-root': {
      color:
        input_field('dark').input_field.text
          .ds_input_field_default_label_text_color,
      fontSize: `${typography('dark').body.ds_font_body_2_regular.fontSize}px`,
      lineHeight: `${
        typography('dark').body.ds_font_body_2_regular.lineHeight
      }px`,
      transform: 'translate(12px,9px) scale(1)',

      '&.Mui-focused': {
        color:
          input_field('dark').input_field.text
            .ds_input_field_focus_label_text_color
      },
      '&.Mui-error': {
        color:
          input_field('dark').input_field.text
            .ds_input_field_error_label_text_color
      },
      '&.Mui-disabled': {
        color:
          input_field('dark').input_field.text
            .ds_input_field_disable_label_text_color
      }
    },
    '&-shrink': {
      top: '0px',
      transform: 'translate(8px,-8px) scale(.8)',
      paddingLeft: `${
        input_field('dark').ds_input_field_label_background_horizontal_spacing
      }px`,
      paddingRight: `${
        input_field('dark').ds_input_field_label_background_horizontal_spacing
      }px`
    }
  },

  '& .MuiOutlinedInput-input': {
    boxSizing: 'border-box',
    '&:WebkitAutofill': {
      WebkitBoxShadow: '0 0 0 100px #121212 inset',
      WebkitTextFillColor:
        input_field('dark').input_field.text
          .ds_input_field_default_lnput_text_color
    },
    '&.Mui-disabled': {
      WebkitTextFillColor:
        input_field('dark').input_field.text
          .ds_input_field_default_label_text_color
    }
  },

  'input:-internal-autofill-selected ': {
    backgroundColor: 'transparent'
  },
  '&.iconRightPadding': {
    '& .MuiOutlinedInput-root': {
      paddingRight: `${
        input_field('dark').ds_input_field_large_horizontal_spacing
      }px`
    }
  },
  '& .MuiInputLabel-outlined': {
    left: '0px'
  },
  '& .MuiTextField-root': {
    height: 'max-content',
    '& .MuiOutlinedInput-notchedOutline': {
      left: '0px'
    }
  },

  '& .MuiOutlinedInput-root': {
    color:
      input_field('dark').input_field.text
        .ds_input_field_default_lnput_text_color,
    fontSize: `${typography('dark').body.ds_font_body_2_regular.fontSize}px`,
    lineHeight: `${
      typography('dark').body.ds_font_body_2_regular.lineHeight
    }px`,
    border: '0px',
    borderRadius: `${input_field('dark').ds_input_field_radius}px`,
    '& fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border
          .ds_input_field_default_border_color
      }`
    },
    '&:hover fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border
          .ds_input_field_default_border_color
      }`
    },
    '&.Mui-focused fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border.ds_input_field_focus_border_color
      }`
    },
    '&.Mui-error fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border.ds_input_field_error_border_color
      }`
    },
    '&.Mui-disabled fieldset': {
      border: `1px solid ${
        input_field('dark').input_field.border
          .ds_input_field_disable_border_color
      }`
    }
  },
  '& .MuiFormHelperText-root': {
    color:
      input_field('dark').input_field.text
        .ds_input_field_default_assistive_text_color,
    fontSize: `${typography('dark').body.ds_font_body_1_regular.fontSize}px`,
    lineHeight: `${
      typography('dark').body.ds_font_body_1_regular.lineHeight
    }px`,
    '&.Mui-error': {
      color:
        input_field('dark').input_field.text
          .ds_input_field_error_assistive_text_color
    },
    '&.Mui-disabled': {
      color:
        input_field('dark').input_field.text
          .ds_input_field_disable_assistive_text_color
    }
  },

  '& .helperText': {
    display: 'flex',
    justifyContent: 'space-between'
  }
}

const styles = () =>
  createStyles({
    dropdownLiItemContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: '8px',
      borderRadius: '4px',
      width: '100%',
      height: '100%',
      '&:hover': {
        background: 'rgba(51, 51, 51, 0.9)'
      },
      '&.selected': {
        background: aliasTokens.cta_hover_secondary_background_color
      },
      rowGap: '4px'
    },
    dropdownLiName: Typography.is('body2').toCSS(),
    descriptionText: {
      marginTop: '4px',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '16px',
      paddingLeft: '12px',
      color: aliasTokens.tertiary_text_color
    },
    dropdownLiCreatedBy: Typography.is('caption1')
      .with({
        // fontStyle: 'italic',
        color: aliasTokens.tertiary_text_color
      })
      .toCSS()
  })

export default styles
