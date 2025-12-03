import {radio_button as radio_buttonTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const radio_button = radio_buttonTheme('dark')
  return {
    marginLeft: '0px',
    marginRight: '0px',
    height: 'max-content',

    '&.MuiFormControlLabel-root': {
      width: 'fit-content',
      display: 'flex',
      gap: `${radio_button.ds_radio_button_text_left_spacing}px`
    },
    '& .MuiRadio-root:hover': {
      backgroundColor: `${radio_button.radio_button.background.ds_radio_button_hover_background_color}4D`
    },

    '&.checked': {
      '& .MuiRadio-root:hover': {
        backgroundColor: `${radio_button.radio_button.background.ds_radio_button_active_hover_background_color}4D`
      }
    },
    '& .MuiRadio-root': {
      width: '32px',
      height: '32px',
      color: radio_button.radio_button.icon.ds_radio_button_default_color,
      '&.Mui-checked': {
        color: radio_button.radio_button.icon.ds_radio_button_active_color
      },
      '&.checked': {
        '& .MuiRadio-root:hover': {
          backgroundColor: `${radio_button.radio_button.background.ds_radio_button_active_hover_background_color}4D`
        }
      },
      '&.Mui-disabled': {
        color: radio_button.radio_button.icon.ds_radio_button_disable_color
      },
      '& .MuiRadio-root': {
        width: '32px',
        height: '32px',
        color: radio_button.radio_button.icon.ds_radio_button_default_color,
        '&.Mui-checked': {
          color: radio_button.radio_button.icon.ds_radio_button_active_color
        },
        '&.Mui-disabled': {
          color: radio_button.radio_button.icon.ds_radio_button_disable_color
        },
        '&:hover': {
          backgroundColor: `${radio_button.radio_button.background.ds_radio_button_hover_background_color}4D`
        }
      }
    },
    '& .MuiTypography-root': {
      color: radio_button.radio_button.text.ds_radio_button_default_text_color,
      lineHeight: '22px',
      fontSize: '14px',
      '&.Mui-disabled': {
        color: radio_button.radio_button.text.ds_radio_button_disable_text_color
      }
    }
  }
}
