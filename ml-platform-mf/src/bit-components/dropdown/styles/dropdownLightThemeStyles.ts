import {createUseStyles} from 'react-jss'
import {
  divider as dividerTheme,
  dropdown as dropdown_menuTheme,
  dropdown_list as dropdown_listTheme,
  input_field as input_fieldTheme,
  typography as typographyTheme
} from '../../design-tokens/index'
import {DropDownSizes} from '../constants'

export const autoCompleteLightStyle = (size) => {
  // eslint-disable-next-line
  const input_field = input_fieldTheme('light')
  return {
    '& .MuiOutlinedInput-root': {
      padding: `${
        size === DropDownSizes.Small
          ? `${input_field.ds_input_field_label_background_horizontal_spacing}px`
          : `${input_field.ds_input_field_large_vertical_spacing}px`
      } ${input_field.ds_input_field_large_vertical_spacing}px `,
      gap: '4px'
    }
  }
}

export const autoCompletePaperLightStyle = () => {
  const divider = dividerTheme('light')
  const typography = typographyTheme('light')
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const dropdown_list = dropdown_listTheme('light')
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const dropdown_menu = dropdown_menuTheme('light')

  return {
    marginTop: '4px',
    background: dropdown_menu.dropdown_menu.ds_dropdown_menu_background_color,
    border: `${divider.ds_divider_vertical_border_weight}px ${divider.border_style.ds_divider_vertical_border_solid} ${dropdown_menu.dropdown_menu.ds_dropdown_menu_border_color} !important`,
    borderImageSource:
      'linear-gradient(159.9deg, rgba(77, 77, 77, 0.5) 0.84%, rgba(77, 77, 77, 0) 32.99%)',
    boxShadow: '0px 4px 10px 0px #00000040',
    color: '#D9D9D9',
    fontFamily: `${typography.body.ds_font_body_2_regular.fontFamily}px`,
    fontWeight: `${typography.body.ds_font_body_2_regular.fontWeight}px`,
    fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
    lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
    '& .MuiAutocomplete-noOptions': {
      color: '#D9D9D9'
    },
    '& .MuiAutocomplete-listbox': {
      padding: `0px ${dropdown_menu.ds_dropdown_menu_horizontal_spacing}px`,

      '& .MuiAutocomplete-option[aria-selected="true"]': {
        backgroundColor:
          dropdown_list.dropdown_list.hover
            .ds_dropdown_list_item_hover_background_color
      },
      '& .MuiAutocomplete-option': {
        padding: '0px',
        borderRadius: `${dropdown_list.ds_dropdown_list_item_radius}px`,
        marginTop: `${dropdown_menu.ds_dropdown_menu_list_item_inline_spacing}px`,
        marginBottom: `${dropdown_menu.ds_dropdown_menu_list_item_inline_spacing}px`,
        '&.Mui-focused': {
          backgroundColor:
            dropdown_list.dropdown_list.hover
              .ds_dropdown_list_item_hover_background_color
        }
      }
    }
  }
}

export const inputLightStyles = (disabled) => {
  // eslint-disable-next-line
  const input_field = input_fieldTheme('light')
  const divider = dividerTheme('light')
  const typography = typographyTheme('light')
  // eslint-disable-next-line
  const dropdown_list = dropdown_listTheme('light')
  return {
    '&.disableInputBar': {
      '& .MuiInputBase-input': {
        visibility: 'hidden'
      }
    },
    '&.large': {
      '& .MuiOutlinedInput-input': {
        padding: `0px`,
        height: '24px',
        maxWidth: 'fit-content'
      },
      '& .MuiInputLabel': {
        '&-root': {
          fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
          lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
          transform: 'translate(12px,9px) scale(1)'
        },
        '&-shrink': {
          top: '0px',
          transform: 'translate(8px,-8px) scale(.8)',
          paddingLeft: `${input_field.ds_input_field_label_background_horizontal_spacing}px`,
          paddingRight: `${input_field.ds_input_field_label_background_horizontal_spacing}px`
        }
      },
      '& .MuiOutlinedInput-notchedOutline': {
        '& legend': {
          '& span': {
            fontSize: '11px'
          }
        }
      }
    },
    '&.small': {
      '& .MuiOutlinedInput-input': {
        padding: `0px`,
        height: '24px',
        maxWidth: 'fit-content'
      },
      '& .MuiInputLabel': {
        '&-root': {
          fontSize: `${typography.body.ds_font_body_2_regular.fontSize}px`,
          lineHeight: `${typography.body.ds_font_body_2_regular.lineHeight}px`,
          transform: 'translate(12px,5px) scale(1)'
        },
        '&-shrink': {
          top: '0px',
          transform: 'translate(8px,-9px) scale(.8)',
          paddingLeft: `${input_field.ds_input_field_label_background_horizontal_spacing}px`,
          paddingRight: `${input_field.ds_input_field_label_background_horizontal_spacing}px`
        }
      },
      '& .MuiOutlinedInput-notchedOutline': {
        '& legend': {
          '& span': {
            fontSize: '11px'
          }
        }
      },
      '& .helperText': {
        display: 'flex',
        justifyContent: 'space-between'
      }
    },

    '& .MuiAutocomplete-clearIndicator': {
      borderRight: `${divider.ds_divider_vertical_border_weight}px ${divider.border_style.ds_divider_vertical_border_solid}  ${divider.divider.ds_divider_border_generic_color}`,
      borderRadius: '0px',
      marginRight: `${dropdown_list.ds_dropdown_list_item_leading_icon_right_spacing}px`,
      paddingRight: `${dropdown_list.ds_dropdown_list_item_leading_icon_right_spacing}px`
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
    '&.iconRightPadding': {
      '& .MuiOutlinedInput-root': {
        paddingRight: `${input_field.ds_input_field_large_horizontal_spacing}px`
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
    // '.css-1fbaou4-MuiFormControl-root-MuiTextField-root .MuiOutlinedInput-root.Mui-disabled fieldset',

    '& .MuiOutlinedInput-root': {
      flexWrap: 'wrap',
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
      //
      ...(disabled && {
        '&.Mui-disabled fieldset': {
          border: `1px solid ${input_field.input_field.border.ds_input_field_disable_border_color}`
        }
      })
    },
    '& .withoutOutline.MuiOutlinedInput-root:not(:hover):not(.Mui-focused) fieldset':
      {
        border: 'none'
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

    '& .helperText': {
      display: 'flex',
      justifyContent: 'space-between'
    },

    '& .accordion': {
      color:
        input_field.input_field.text.ds_input_field_default_label_text_color
    }
  }
}

export const stylesLightTheme = createUseStyles({
  chipWrapper: {},
  loadingContainer: {
    display: 'flex',
    width: '100%',
    margin: 4,

    alignItems: 'center'
  },
  loadingIcon: {
    display: 'flex',
    marginRight: 4
  },
  loadingText: {
    display: 'flex'
  },
  addOptionsTextWrap: {
    wordWrap: 'break-word'
  }
})
