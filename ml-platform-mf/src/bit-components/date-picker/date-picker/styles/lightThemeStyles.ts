import {
  date_time_picker as date_time_pickerTheme,
  input_field as input_fieldTheme,
  typography as typographyTheme
} from '../../../design-tokens/index'

export const datePickerLightStyle = () => {
  // eslint-disable-next-line
  const input_field = input_fieldTheme('light')
  const typography = typographyTheme('light')
  return {
    '&.medium': {
      '& .MuiOutlinedInput-input': {
        padding: `${input_field.ds_input_field_large_vertical_spacing}px ${input_field.ds_input_field_large_horizontal_spacing}px`,
        height: `${input_field.ds_input_field_large_input_box_height}px`,
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
      '&.noBorder': {
        '& .MuiOutlinedInput-notchedOutline': {
          border: 0
        }
      },
      '&.noBlinkingCursor': {
        '& .MuiOutlinedInput-input': {
          color: 'transparent',
          textShadow: `0 0 0 ${input_field.input_field.text.ds_input_field_default_label_text_color}`,
          '&:focus': {
            outline: 'none'
          }
        }
      },
      '& .MuiOutlinedInput-notchedOutline': {
        left: '-5px',
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

export const datePickerPoperLightStyle = () => {
  // eslint-disable-next-line
  const date_time_picker = date_time_pickerTheme('light')
  return {
    background:
      date_time_picker.date_time_picker.background
        .ds_date_time_picker_background_color,

    '&.MuiPaper-root': {
      color:
        date_time_picker.date_time_picker.text
          .ds_date_time_picker_default_text_color
    },
    '& .MuiPickersArrowSwitcher-root': {
      '& .MuiPickersArrowSwitcher-button': {
        color:
          date_time_picker.date_time_picker.icon
            .ds_date_time_picker_deafult_icon_color
      }
    },
    '& .MuiIconButton-root': {
      color:
        date_time_picker.date_time_picker.icon
          .ds_date_time_picker_deafult_icon_color
    },
    '& .MuiTypography-root': {
      color:
        date_time_picker.date_time_picker.text
          .ds_date_time_picker_default_text_color
    },
    '& .MuiPickersDay-root': {
      color:
        date_time_picker.date_time_picker.text
          .ds_date_time_picker_default_text_color,
      background:
        date_time_picker.date_time_picker.background
          .ds_date_time_picker_selctor_default_background_color,
      '&:hover': {
        background:
          date_time_picker.date_time_picker.background
            .ds_date_time_picker_selctor_active_background_color,
        color:
          date_time_picker.date_time_picker.text
            .ds_date_time_picker_selecter_default_text_color
      },
      '&.Mui-selected': {
        color:
          date_time_picker.date_time_picker.text
            .ds_date_time_picker_selecter_default_text_color
      },
      '&.Mui-disabled': {
        color:
          date_time_picker.date_time_picker.icon
            .ds_date_time_picker_disabled_icon_color
      }
    },
    '& .MuiPickersArrowSwitcher-button.Mui-disabled': {
      color:
        date_time_picker.date_time_picker.icon
          .ds_date_time_picker_disabled_icon_color
    },
    '& .PrivatePickersYear-root': {
      '& .PrivatePickersYear-yearButton': {
        '&:hover': {
          background:
            date_time_picker.date_time_picker.background
              .ds_date_time_picker_selctor_active_background_color,
          color:
            date_time_picker.date_time_picker.text
              .ds_date_time_picker_selecter_default_text_color
        },
        '&.Mui-selected': {
          background:
            date_time_picker.date_time_picker.background
              .ds_date_time_picker_selctor_active_background_color,
          color:
            date_time_picker.date_time_picker.text
              .ds_date_time_picker_selecter_default_text_color
        }
      }
    },

    '& .PrivatePickersFadeTransitionGroup-root::-webkit-scrollbar': {
      display: 'none'
    },
    '& .PrivatePickersFadeTransitionGroup-root': {
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none'
    }
  }
}
