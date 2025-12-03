import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

import {
  date_time_picker as date_time_pickerTheme,
  input_field as input_fieldTheme,
  typography as typographyTheme
} from '../../bit-components/design-tokens/index'

const styles = () =>
  createStyles({
    filterButton: {
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      padding: '4px 8px 4px 12px',
      borderRadius: '40px',
      color: '#F5F5F5',
      textTransform: 'capitalize',
      '&.active': {
        backgroundColor: '#0074E8'
      },
      '&.Mui-disabled': {
        backgroundColor: aliasTokens.cta_disabled_secondary_background_color
      }
    },
    popoverContainer: {
      display: 'flex'
    },
    left: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      borderRight: `1px solid ${aliasTokens.disabled_border_color}`,
      fontSize: '12px',
      fontWeight: 400,

      '& div': {
        marginTop: '8px',
        padding: '8px 16px 8px 8px',
        borderRadius: '4px',
        cursor: 'pointer',

        '&:first-of-type': {
          marginTop: 0
        },

        '&:hover': {
          backgroundColor: aliasTokens.cta_hover_secondary_background_color
        },

        '&.selected': {
          backgroundColor: aliasTokens.cta_hover_secondary_background_color
        }
      }
    },
    right: {
      padding: '16px',

      '& div': {
        display: 'flex',
        marginTop: '12px',
        alignItems: 'center',

        '&:first-of-type': {
          marginTop: 0
        }
      }
    },
    datePicker: {
      '& .MuiOutlinedInput-root': {
        width: '216px'
      },
      '& .MuiInputLabel-root': {
        top: '-10px',
        fontSize: '14px',

        '&.MuiInputLabel-shrink': {
          top: '0px'
        }
      }
    },
    timePicker: {},
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '8px 0',

      '& button': {
        marginLeft: '8px',

        '&:first-of-type': {
          marginLeft: 0
        }
      }
    }
  })

export const timePickerDarkStyle = () => {
  // eslint-disable-next-line
  const input_field = input_fieldTheme('dark')
  const typography = typographyTheme('dark')
  return {
    '&.medium': {
      '& .MuiOutlinedInput-input': {
        padding: `${input_field.ds_input_field_large_vertical_spacing}px ${input_field.ds_input_field_large_horizontal_spacing}px`,
        boxSizing: 'content-box'
      },
      '& .MuiInputLabel': {
        '&-root': {
          fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
          lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
          transform: 'translate(12px,9px) scale(1)'
        },
        '&-shrink': {
          top: '0px',
          transform: 'translate(8px,-8px) scale(.85)',
          paddingLeft: `${input_field.ds_input_field_label_background_horizontal_spacing}px`,
          paddingRight: `${input_field.ds_input_field_label_background_horizontal_spacing}px`
        }
      },
      '& .MuiOutlinedInput-notchedOutline': {
        '& legend': {
          '& span': {
            fontSize: `${typography.body.ds_font_body_1_regular.fontSize}px`
          }
        }
      }
    },
    '&.MuiTextField-root': {
      height: 'max-content',
      width: '100%'
    },

    '& .MuiInputLabel': {
      '&-root': {
        color:
          input_field.input_field.text.ds_input_field_default_label_text_color,

        '&.Mui-focused': {
          color:
            input_field.input_field.text.ds_input_field_focus_label_text_color
        },
        '&.Mui-error': {
          color:
            input_field.input_field.text.ds_input_field_error_label_text_color
        },
        '&.Mui-disabled': {
          color:
            input_field.input_field.text.ds_input_field_disable_label_text_color
        }
      }
    },

    '& .MuiOutlinedInput-input': {
      boxSizing: 'border-box',
      '&:WebkitAutofill': {
        WebkitBoxShadow: '0 0 0 100px #121212 inset',
        WebkitTextFillColor:
          input_field.input_field.text.ds_input_field_default_lnput_text_color
      },
      '&.Mui-disabled': {
        WebkitTextFillColor:
          input_field.input_field.text.ds_input_field_default_label_text_color
      }
    },

    'input:-internal-autofill-selected ': {
      backgroundColor: 'transparent'
    },
    '& .MuiOutlinedInput-root': {
      color:
        input_field.input_field.text.ds_input_field_default_lnput_text_color,
      fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
      lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
      border: '0px',
      borderRadius: `${input_field.ds_input_field_radius}px`,
      '& fieldset': {
        border: `1px solid ${input_field.input_field.border.ds_input_field_default_border_color}`
      },
      '&:hover fieldset': {
        border: `1px solid ${input_field.input_field.border.ds_input_field_default_border_color}`
      },
      '&.Mui-focused fieldset': {
        border: `1px solid ${input_field.input_field.border.ds_input_field_focus_border_color}`
      },
      '&.Mui-error fieldset': {
        border: `1px solid ${input_field.input_field.border.ds_input_field_error_border_color}`
      },
      '&.Mui-disabled fieldset': {
        border: `1px solid ${input_field.input_field.border.ds_input_field_disable_border_color}`
      }
    },
    '& .MuiFormHelperText-root': {
      color:
        input_field.input_field.text
          .ds_input_field_default_assistive_text_color,
      fontSize: `${typography.body.ds_font_body_1_regular.fontSize}px`,
      lineHeight: `${typography.body.ds_font_body_1_regular.lineHeight}px`,
      '&.Mui-error': {
        color:
          input_field.input_field.text.ds_input_field_error_assistive_text_color
      },
      '&.Mui-disabled': {
        color:
          input_field.input_field.text
            .ds_input_field_disable_assistive_text_color
      }
    },
    '& .MuiSvgIcon-root': {
      color:
        input_field.input_field.text.ds_input_field_default_lnput_text_color,
      fontSize: '20px',
      width: '20px',
      height: '20px'
    },
    '& .Mui-disabled': {
      '& .MuiSvgIcon-root': {
        color:
          input_field.input_field.text
            .ds_input_field_disable_assistive_text_color
      }
    }
  }
}
export const timePickerPoperDarkStyle = () => {
  // eslint-disable-next-line
  const date_time_picker = date_time_pickerTheme('dark')
  return {
    background:
      date_time_picker.date_time_picker.background
        .ds_date_time_picker_background_color,
    '& .css-1flhz3h': {
      color:
        date_time_picker.date_time_picker.text
          .ds_date_time_picker_selecter_default_text_color
    },
    '& .css-x9nfkm': {
      color:
        date_time_picker.date_time_picker.text
          .ds_date_time_picker_selecter_default_text_color
    },
    '& .Mui-selected': {
      '&.css-1flhz3h': {
        color:
          date_time_picker.date_time_picker.background
            .ds_date_time_picker_selctor_default_background_color
      },
      '& .css-x9nfkm': {
        color:
          date_time_picker.date_time_picker.background
            .ds_date_time_picker_selctor_default_background_color
      }
    },
    '& .Mui-disabled': {
      '&.css-1flhz3h': {
        color:
          date_time_picker.date_time_picker.icon
            .ds_date_time_picker_disabled_icon_color
      },
      '& .css-x9nfkm': {
        color:
          date_time_picker.date_time_picker.icon
            .ds_date_time_picker_disabled_icon_color
      }
    },
    '&.MuiPaper-root': {
      color:
        date_time_picker.date_time_picker.text
          .ds_date_time_picker_selecter_default_text_color
    },
    '& .MuiPickersArrowSwitcher-root': {
      '& .MuiPickersArrowSwitcher-button': {
        color: 'rgb(245, 245, 245)'
      }
    },
    '& .MuiIconButton-root': {
      color:
        date_time_picker.date_time_picker.icon
          .ds_date_time_picker_deafult_icon_color
    },
    '& .MuiPickersArrowSwitcher-button.Mui-disabled': {
      color: 'rgb(77, 77, 77)'
    },
    '& .MuiClockPicker-root': {
      '& .MuiTypography-root': {
        color:
          date_time_picker.date_time_picker.text
            .ds_date_time_picker_selecter_default_text_color
      },
      '& .css-2kvppe': {
        backgroundColor: 'rgb(25, 118, 210)'
      },
      '& .css-13u0ei8': {
        color: 'rgb(245, 245, 245)'
      },
      '& .css-j5hn0v-MuiButtonBase-root-MuiIconButton-root': {
        backgroundColor: 'rgb(25, 118, 210)'
      },
      '& .css-a5c8da-MuiButtonBase-root-MuiIconButton-root': {
        backgroundColor: 'rgb(25, 118, 210)'
      },
      '& .css-fspknh': {
        backgroundColor: 'rgb(25, 118, 210)',

        '& .css-iyl3fz': {
          backgroundColor: 'rgb(25, 118, 210)',
          border: '16px solid rgb(25, 118, 210)'
        }
      },
      '& .css-medvji': {
        backgroundColor: 'rgb(25, 118, 210)',

        '& .css-iyl3fz': {
          backgroundColor: 'rgb(25, 118, 210)',
          border: '16px solid rgb(25, 118, 210)'
        }
      }
    },
    '& .MuiClockPicker-arrowSwitcher': {
      '& .MuiButtonBase-root.Mui-disabled': {
        color: 'rgb(77, 77, 77)'
      }
    }
  }
}

export default styles
