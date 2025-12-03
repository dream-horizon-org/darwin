import {checkbox as checkboxTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  const checkbox = checkboxTheme('dark')
  return {
    '&.MuiFormControlLabel-root': {
      width: 'fit-content',
      height: 'fit-content',
      marginRight: '0px',
      marginLeft: '0px'
    },
    '& .container': {
      position: 'relative',
      width: '32px',
      height: '32px',
      marginRight: '0px',
      marginLeft: '0px',
      '&:hover': {
        '& .box.enabled': {
          background:
            checkbox.checkbox.background.ds_checkbox_hover_background_color,
          opacity: 0.3
        },
        '&.checked': {
          '& .box.enabled': {
            background:
              checkbox.checkbox.background
                .ds_checkbox_active_hover_background_color,
            opacity: 0.3
          }
        }
      }
    },
    '& .box': {
      position: 'absolute',
      width: `${checkbox.ds_checkbox_size}px`,
      height: `${checkbox.ds_checkbox_size}px`,
      padding: `${checkbox.ds_checkbox_spacing}px`,
      borderRadius: '50%'
    },
    '& .MuiCheckbox-root': {
      position: 'absolute',
      padding: `${checkbox.ds_checkbox_spacing}px`,
      color: checkbox.checkbox.icon.ds_checkbox_default_color,
      '& .MuiSvgIcon-root': {
        width: `${checkbox.ds_checkbox_size}px`,
        height: `${checkbox.ds_checkbox_size}px`
      },
      '&.Mui-checked': {
        color: checkbox.checkbox.icon.ds_checkbox_active_color
      },
      '&.Mui-disabled': {
        color: checkbox.checkbox.icon.ds_checkbox_disable_color
      }
    },

    '& .MuiTypography-root': {
      color: checkbox.checkbox.text.ds_checkbox_default_text_color,
      marginLeft: `${checkbox.ds_checkbox_text_left_spacing}px`,
      lineHeight: '22px',
      fontSize: '14px',
      '&.Mui-disabled': {
        color: checkbox.checkbox.text.ds_checkbox_disable_text_color
      }
    },
    '& .disabled': {
      '& .MuiTypography-root': {
        color: checkbox.checkbox.text.ds_checkbox_disable_text_color
      }
    }
  }
}
