import {textarea as textareaTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  const textarea = textareaTheme('dark')
  return {
    '&.medium': {
      '& .MuiOutlinedInput-input': {
        height: `${textarea.ds_textarea_large_input_box_height}px`
      },

      '& .MuiInputLabel': {
        '&-root': {
          fontSize: '14px',
          lineHeight: '20px',
          transform: 'translate(12px,8px) scale(1)'
        },
        '&-shrink': {
          top: '0px',
          fontSize: '12px',
          lineHeight: '16px',
          transform: 'translate(8px,-8px) scale(1)',
          paddingLeft: `${textarea.ds_textarea_label_background_horizontal_spacing}`,
          paddingRight: `${textarea.ds_textarea_label_background_horizontal_spacing}`,
          background: `${textarea.textarea.background.ds_textarea_label_background_color}`
        }
      },
      '& .MuiOutlinedInput-root': {
        padding: `${textarea.ds_textarea_large_vertical_spacing}px ${textarea.ds_textarea_large_horizontal_spacing}px`
      },
      '& .MuiOutlinedInput-notchedOutline': {
        top: '-8px',
        '& legend': {
          height: '16px',
          '& span': {
            fontSize: '8px'
          }
        }
      }
    },
    '&.small': {
      '& .MuiOutlinedInput-input': {
        height: `${textarea.ds_textarea_small_input_box_height}px`
      },
      '& .MuiOutlinedInput-root': {
        height: '108px',
        padding: `${textarea.ds_textarea_small_vertical_spacing}px ${textarea.ds_textarea_small_horizontal_spacing}px`
      },
      '& .MuiInputLabel': {
        '&-root': {
          fontSize: '14px',
          lineHeight: '20px',
          transform: 'translate(12px,8px) scale(1)'
        },
        '&-shrink': {
          top: '0px',
          fontSize: '12px',
          lineHeight: '16px',
          transform: 'translate(7px,-8px) scale(1)',
          paddingLeft: `${textarea.ds_textarea_label_background_horizontal_spacing}`,
          paddingRight: `${textarea.ds_textarea_label_background_horizontal_spacing}`,
          background: `${textarea.textarea.background.ds_textarea_label_background_color}`
        }
      },
      '& .MuiOutlinedInput-notchedOutline': {
        top: '-8px',
        '& legend': {
          height: '16px',
          '& span': {
            fontSize: '10px'
          }
        }
      }
    },

    '&.MuiTextField-root': {
      height: 'max-content'
    },

    '& .MuiInputLabel': {
      '&-root': {
        color: textarea.textarea.text.ds_textarea_default_label_text_color,

        '&.Mui-focused': {
          color: textarea.textarea.text.ds_textarea_focus_label_text_color
        },
        '&.Mui-error': {
          color: textarea.textarea.text.ds_textarea_error_label_text_color
        },
        '&.Mui-disabled': {
          color: textarea.textarea.text.ds_textarea_disable_label_text_color
        }
      }
    },

    '& .MuiOutlinedInput-input': {
      boxSizing: 'border-box',
      '&:WebkitAutofill': {
        WebkitBoxShadow: '0 0 0 100px #121212 inset',
        WebkitTextFillColor:
          textarea.textarea.text.ds_textarea_default_lnput_text_color
      },
      '&.Mui-disabled': {
        WebkitTextFillColor:
          textarea.textarea.text.ds_textarea_disable_lnput_text_color
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
      color: textarea.textarea.text.ds_textarea_default_lnput_text_color,
      lineHeight: '20px',
      fontSize: '14px',
      border: '0px',
      borderRadius: `${textarea.ds_textarea_radius}px`,
      '&.Mui-disabled': {
        color: textarea.textarea.text.ds_textarea_disable_lnput_text_color
      },
      '& fieldset': {
        border: `1px solid ${textarea.textarea.border.ds_textarea_deafult_border_color}`
      },
      '&:hover fieldset': {
        border: `1px solid ${textarea.textarea.border.ds_textarea_deafult_border_color}`
      },
      '&.Mui-focused fieldset': {
        border: `1px solid ${textarea.textarea.border.ds_textarea_focus_border_color}`
      },
      '&.Mui-error fieldset': {
        border: `1px solid ${textarea.textarea.border.ds_textarea_error_border_color}`
      },
      '&.Mui-disabled fieldset': {
        border: `1px solid ${textarea.textarea.border.ds_textarea_disable_border_color}`
      }
    },
    '& .MuiFormHelperText-root': {
      color: textarea.textarea.text.ds_textarea_default_assistive_text_color,
      fontSize: '12px',
      lineHeight: '16px',
      marginRight: `${textarea.ds_textarea_assistive_text_left_spacing}`,
      marginLeft: `${textarea.ds_textarea_counter_text_right_spacing}`,
      '&.Mui-error': {
        color: textarea.textarea.text.ds_textarea_error_assistive_text_color
      },
      '&.Mui-disabled': {
        color: textarea.textarea.text.ds_textarea_disable_assistive_text_color
      }
    },

    '& .helperText': {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }
}
