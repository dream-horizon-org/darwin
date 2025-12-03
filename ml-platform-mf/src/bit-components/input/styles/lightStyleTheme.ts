import {createUseStyles} from 'react-jss'
import {input_field as input_fieldTheme} from '../../design-tokens/index'

const inputField = input_fieldTheme('light')
export const stylesLightThemeInputStyles = {
  '&.medium': {
    '& .MuiOutlinedInput-input': {
      padding: `${inputField.ds_input_field_large_vertical_spacing}px ${inputField.ds_input_field_large_horizontal_spacing}px`,
      height: `${inputField.ds_input_field_large_input_box_height}px`,
      boxSizing: 'content-box'
    },
    '& .MuiInputLabel': {
      '&-root': {
        fontSize: '14px',
        lineHeight: '20px',
        transform: 'translate(12px,9px) scale(1)'
      },
      '&-shrink': {
        top: '0px',
        transform: 'translate(8px,-8px) scale(.8)',
        paddingLeft: `${inputField.ds_input_field_label_background_horizontal_spacing}px`,
        paddingRight: `${inputField.ds_input_field_label_background_horizontal_spacing}px`,
        background:
          inputField.input_field.background
            .ds_input_field_label_background_color
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      '& legend': {
        '& span': {
          fontSize: '8px'
        }
      }
    },
    '&.MuiTextField-root': {
      height: 'max-content'
    }
  },
  '&.small': {
    '& .MuiOutlinedInput-input': {
      padding: `${inputField.ds_input_field_small_vertical_spacing}px ${inputField.ds_input_field_small_horizontal_spacing}px`,
      height: `${inputField.ds_input_field_small_input_box_height}px`,
      boxSizing: 'content-box'
    },
    '& .MuiInputLabel': {
      '&-root': {
        fontSize: '14px',
        lineHeight: '20px',
        transform: 'translate(12px,5px) scale(1)'
      },
      '&-shrink': {
        top: '0px',
        transform: 'translate(8px,-9px) scale(.8)',
        paddingLeft: `${inputField.ds_input_field_label_background_horizontal_spacing}px`,
        paddingRight: `${inputField.ds_input_field_label_background_horizontal_spacing}px`,
        background:
          inputField.input_field.background
            .ds_input_field_label_background_color
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      '& legend': {
        '& span': {
          fontSize: '8px'
        }
      }
    },
    '&.MuiTextField-root': {
      height: 'max-content'
    }
  },

  '& .MuiInputLabel': {
    '&-root': {
      color:
        inputField.input_field.text.ds_input_field_default_label_text_color,

      '&.Mui-focused': {
        color: inputField.input_field.text.ds_input_field_focus_label_text_color
      },
      '&.Mui-error': {
        color: inputField.input_field.text.ds_input_field_error_label_text_color
      },
      '&.Mui-disabled': {
        color:
          inputField.input_field.text.ds_input_field_disable_label_text_color
      }
    }
  },

  '& .MuiOutlinedInput-input': {
    boxSizing: 'border-box',
    '&:WebkitAutofill': {
      WebkitBoxShadow: '0 0 0 100px #121212 inset',
      WebkitTextFillColor:
        inputField.input_field.text.ds_input_field_default_lnput_text_color
    },
    '&.Mui-disabled': {
      WebkitTextFillColor:
        inputField.input_field.text.ds_input_field_default_label_text_color
    }
  },

  'input:-internal-autofill-selected ': {
    backgroundColor: 'transparent'
  },
  '&.iconRightPadding': {
    '& .MuiOutlinedInput-root': {
      paddingRight: `${inputField.ds_input_field_large_horizontal_spacing}px`
    }
  },
  '&.autoSave': {
    '& .MuiOutlinedInput-input': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    '& fieldset': {
      borderWidth: '0px'
    },
    '& .Mui-focused fieldset': {
      borderWidth: '1px'
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
    color: inputField.input_field.text.ds_input_field_default_lnput_text_color,
    lineHeight: '20px',
    fontSize: '14px',
    border: '0px',
    borderRadius: `${inputField.ds_input_field_radius}px`,
    '& fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_default_border_color}`
    },
    '&:hover fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_default_border_color}`
    },
    '&.Mui-focused fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_focus_border_color}`
    },
    '&.Mui-error fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_error_border_color}`
    },
    '&.Mui-disabled fieldset': {
      border: `1px solid ${inputField.input_field.border.ds_input_field_disable_border_color}`
    }
  },
  '& .withoutOutline.MuiOutlinedInput-root:not(:hover):not(.Mui-focused) fieldset':
    {
      border: 'none'
    },
  '& .MuiFormHelperText-root': {
    color:
      inputField.input_field.text.ds_input_field_default_assistive_text_color,
    fontSize: '12px',
    lineHeight: '16px',
    position: 'relative',
    '&.Mui-error': {
      color:
        inputField.input_field.text.ds_input_field_error_assistive_text_color
    },
    '&.Mui-disabled': {
      color:
        inputField.input_field.text.ds_input_field_disable_assistive_text_color
    }
  },

  '& .helperText': {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '0'
  },
  '& .resetPositionForText': {
    position: 'unset'
  },

  '& .icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&.medium': {
      fontSize: '20px',
      width: `${inputField.ds_input_field_large_icon_size}px`,
      height: `${inputField.ds_input_field_large_icon_size}px`
    },
    '&.small': {
      fontSize: '16px',
      width: `${inputField.ds_input_field_small_icon_size}px`,
      height: `${inputField.ds_input_field_small_icon_size}px`
    },
    '&:before': {
      color: inputField.input_field.text.ds_input_field_default_label_text_color
    }
  },
  '& .filled': {
    '&.icon:before': {
      color: inputField.input_field.text.ds_input_field_default_label_text_color
    }
  },
  '&.disabled': {
    '& .icon': {
      cursor: 'default'
    },
    '& .icon:before': {
      color: inputField.input_field.text.ds_input_field_disable_label_text_color
    }
  },

  '& .Mui-focused': {
    '& .icon:before': {
      color: inputField.input_field.text.ds_input_field_default_label_text_color
    }
  }
}

export const stylesLightThemeInputBorderStyles = createUseStyles({
  hideDefaultBorder: {
    '&.MuiFormControl-root > .MuiOutlinedInput-root:not(:hover, :active) > fieldset':
      {
        borderColor: 'transparent'
      }
  }
})
