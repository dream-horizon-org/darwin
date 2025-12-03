import {toggle_button as toggle_buttonTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  // eslint-disable-next-line
  const toggle_button = toggle_buttonTheme('dark')
  return {
    height: '32px',
    '& .MuiToggleButton-root': {
      padding: `${toggle_button.ds_toggle_button_vertical_spacing}px ${toggle_button.ds_toggle_button_horizontal_spacing}px`,
      borderColor:
        toggle_button.toggle_button.default
          .ds_toggle_button_default_border_color,
      color:
        toggle_button.toggle_button.default
          .ds_toggle_button_default2_text_color,
      fontSize: '12px',
      lineHeight: '16px',
      '& .icon:before': {
        color:
          toggle_button.toggle_button.default
            .ds_toggle_button_default_icon_color,
        width: `${toggle_button.ds_toggle_button_icon_size}px`,
        height: `${toggle_button.ds_toggle_button_icon_size}px`,
        fontSize: `${toggle_button.ds_toggle_button_icon_size}px`
      },
      '&.Mui-disabled': {
        borderColor:
          toggle_button.toggle_button.disable
            .ds_toggle_button_disable_border_color,
        color:
          toggle_button.toggle_button.disable
            .ds_toggle_button_disable_text_color,
        '& .icon:before': {
          color:
            toggle_button.toggle_button.disable
              .ds_toggle_button_disable_icon_color
        }
      }
    },
    '&.primary': {
      '& .MuiToggleButton-root': {
        '&:hover': {
          background:
            toggle_button.toggle_button.hover
              .ds_toggle_button_hover_background_color
        },
        '&.Mui-selected': {
          background:
            toggle_button.toggle_button.active
              .ds_toggle_button_active_background_color_copy,
          borderColor:
            toggle_button.toggle_button.active
              .ds_toggle_button_active_border_color,
          color:
            toggle_button.toggle_button.default
              .ds_toggle_button_default2_text_color
        }
      }
    },
    '&.secondary': {
      '& .button-0': {
        '&.MuiToggleButton-root': {
          '&:hover': {
            background:
              toggle_button.toggle_button.hover
                .ds_toggle_button_hover_background_color
          },
          '&.Mui-selected': {
            background:
              toggle_button.toggle_button.success
                .ds_toggle_button_success_background_color,
            borderColor:
              toggle_button.toggle_button.success
                .ds_toggle_button_success_border_color,
            color:
              toggle_button.toggle_button.default
                .ds_toggle_button_default2_text_color
          }
        }
      },
      '& .button-1': {
        '&.MuiToggleButton-root': {
          '&:hover': {
            background:
              toggle_button.toggle_button.hover
                .ds_toggle_button_hover_background_color
          },
          '&.Mui-selected': {
            background:
              toggle_button.toggle_button.error
                .ds_toggle_button_error_background_color,
            borderColor:
              toggle_button.toggle_button.error
                .ds_toggle_button_error_border_color,
            color:
              toggle_button.toggle_button.default
                .ds_toggle_button_default2_text_color
          }
        }
      }
    },
    '&.tertiary': {
      '& .button-1': {
        '&.MuiToggleButton-root': {
          '&:hover': {
            background:
              toggle_button.toggle_button.hover
                .ds_toggle_button_hover_background_color
          },
          '&.Mui-selected': {
            background:
              toggle_button.toggle_button.success
                .ds_toggle_button_success_background_color,
            borderColor:
              toggle_button.toggle_button.success
                .ds_toggle_button_success_border_color,
            color:
              toggle_button.toggle_button.default
                .ds_toggle_button_default2_text_color
          }
        }
      },
      '& .button-0': {
        '&.MuiToggleButton-root': {
          '&:hover': {
            background:
              toggle_button.toggle_button.hover
                .ds_toggle_button_hover_background_color
          },
          '&.Mui-selected': {
            background:
              toggle_button.toggle_button.error
                .ds_toggle_button_error_background_color,
            borderColor:
              toggle_button.toggle_button.error
                .ds_toggle_button_error_border_color,
            color:
              toggle_button.toggle_button.default
                .ds_toggle_button_default2_text_color
          }
        }
      }
    }
  }
}
