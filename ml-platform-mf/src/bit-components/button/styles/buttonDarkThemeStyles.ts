import {button as buttonTheme} from '../../design-tokens/index'
export const stylesDarkTheme = () => {
  const button = buttonTheme('dark')
  return {
    textTransform: 'uppercase',
    '&.smallFont': {
      textTransform: 'none'
    },
    fontWeight: 700,
    minWidth: 'unset',
    height: 'max-content',
    '&.maxWidth': {
      width: '100%'
    },
    '&.large': {
      padding: `${button.ds_button_large_no_icon_vertical_spacing}px ${button.ds_button_large_no_icon_horizontal_spacing}px`,
      lineHeight: '24px',
      fontSize: '16px',
      height: '40px',
      whiteSpace: 'nowrap',
      '&.leadingIcon': {
        padding: `${button.ds_button_large_with_leading_icon_vertical_spacing}px ${button.ds_button_large_no_icon_horizontal_spacing}px ${button.ds_button_large_with_leading_icon_vertical_spacing}px ${button.ds_button_large_with_leading_icon_left_spacing}px`
      },
      '&.trailingIcon': {
        padding: `${button.ds_button_large_with_leading_icon_vertical_spacing}px ${button.ds_button_large_with_trailing_icon_right_spacing}px ${button.ds_button_large_with_leading_icon_vertical_spacing}px ${button.ds_button_large_with_trailing_icon_left_spacing}px`
      }
    },
    '&.medium': {
      lineHeight: '20px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      padding: `${button.ds_button_medium_no_icon_vertical_spacing}px ${button.ds_button_medium_no_icon_horizontal_spacing}px`,
      height: '28px',
      '&.leadingIcon': {
        padding: `${button.ds_button_medium_with_leading_icon_vertical_spacing}px ${button.ds_button_medium_with_leading_icon_right_spacing}px ${button.ds_button_medium_with_leading_icon_vertical_spacing}px ${button.ds_button_medium_with_leading_icon_left_spacing}px`
      },
      '&.trailingIcon': {
        padding: `${button.ds_button_medium_with_trailing_icon_vertical_spacing}px ${button.ds_button_medium_with_trailing_icon_right_spacing}px ${button.ds_button_medium_with_trailing_icon_vertical_spacing}px ${button.ds_button_medium_with_trailing_icon_left_spacing}px`
      }
    },
    '&.small': {
      fontSize: '12px',
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      padding: `${button.ds_button_small_no_icon_vertical_spacing}px ${button.ds_button_small_no_icon_horizontal_spacing}px`,
      height: '24px',
      '&.leadingIcon': {
        padding: `${button.ds_button_small_with_leading_icon_vertical_spacing}px ${button.ds_button_small_with_leading_icon_right_spacing}px ${button.ds_button_small_with_leading_icon_vertical_spacing}px ${button.ds_button_small_with_leading_icon_left_spacing}px`
      },
      '&.trailingIcon': {
        padding: `${button.ds_button_small_with_trailing_icon_vertical_spacing}px ${button.ds_button_small_with_trailing_icon_right_spacing}px ${button.ds_button_small_with_trailing_icon_vertical_spacing}px ${button.ds_button_small_with_trailing_icon_left_spacing}px`
      },
      '& .loadingIcon': {
        padding: `${button.ds_button_small_with_trailing_icon_vertical_spacing}px ${button.ds_button_small_with_trailing_icon_left_spacing}px`
      }
    },
    '&.primary': {
      color: button.button.primary.text.ds_button_primary_default_text_color,
      backgroundColor:
        button.button.primary.background
          .ds_button_primary_default_background_color,
      border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.primary.background.ds_button_primary_default_background_color}`,
      boxSizing: 'border-box',
      '& .icon:before': {
        color: button.button.primary.icon.ds_button_primary_default_icon_color
      },

      '&:hover': {
        backgroundColor:
          button.button.primary.background
            .ds_button_primary_hover_background_color,
        border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.primary.background.ds_button_primary_hover_background_color}`,
        color: button.button.primary.text.ds_button_primary_hover_text_color,
        '& .icon:before': {
          color:
            button.button.secondary.icon.ds_button_secondary_hover_icon_color
        }
      },

      '&.disabled': {
        color: button.button.primary.text.ds_button_primary_disable_text_color,
        backgroundColor:
          button.button.primary.background
            .ds_button_primary_disabled_background_color,
        '& .icon:before': {
          color:
            button.button.primary.icon.ds_button_primary_disabled_icon_color
        },
        border: `1px`
      },
      '&:active': {
        backgroundColor:
          button.button.primary.background
            .ds_button_primary_clicked_background_color,
        border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.primary.background.ds_button_primary_clicked_background_color}`,
        color: button.button.primary.text.ds_button_primary_clicked_text_color
      }
    },
    '&.secondary': {
      color:
        button.button.secondary.text.ds_button_secondary_default_text_color,
      border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.secondary.border.ds_button_secondary_default_border_color}`,

      '& .icon:before': {
        color:
          button.button.secondary.icon.ds_button_secondary_default_icon_color
      },
      '&:hover': {
        backgroundColor:
          button.button.secondary.background
            .ds_button_secondary_hover_background_color,
        border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.secondary.background.ds_button_secondary_hover_background_color}`,
        color:
          button.button.secondary.text.ds_button_secondary_hover_text_color,
        '& .icon:before': {
          color:
            button.button.secondary.icon.ds_button_secondary_hover_icon_color
        }
      },
      '&.disabled': {
        color:
          button.button.secondary.text.ds_button_secondary_disable_text_color,
        border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.secondary.border.ds_button_secondary_disabled_border_color}`,
        '& .icon:before': {
          color:
            button.button.secondary.icon.ds_button_secondary_disabled_icon_color
        }
      },
      '&:active': {
        backgroundColor:
          button.button.secondary.background
            .ds_button_secondary_clicked_background_color,
        border: `1px ${button.border_style.ds_button_secondary_border_style} ${button.button.secondary.background.ds_button_secondary_clicked_background_color}`,
        color:
          button.button.secondary.text.ds_button_secondary_clicked_text_color
      }
    },
    '&.tertiary': {
      color: button.button.tertiary.text.ds_button_tertiary_default_text_color,
      '& .icon:before': {
        color: button.button.tertiary.icon.ds_button_tertiary_default_icon_color
      },
      '&:hover': {
        backgroundColor:
          button.button.tertiary.background
            .ds_button_tertiary_hover_background_color,
        color: button.button.tertiary.text.ds_button_tertiary_hover_text_color,
        '& .icon:before': {
          color: button.button.tertiary.icon.ds_button_tertiary_hover_icon_color
        }
      },
      '&.disabled': {
        color:
          button.button.tertiary.text.ds_button_tertiary_disable_text_color,
        '& .icon:before': {
          color:
            button.button.tertiary.icon.ds_button_tertiary_disabled_icon_color
        }
      },
      '&:active': {
        backgroundColor:
          button.button.tertiary.background
            .ds_button_tertiary_clicked_background_color,
        color: button.button.tertiary.text.ds_button_tertiary_clicked_text_color
      }
    },

    '& .MuiButton-startIcon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '0px',
      marginRight: `${button.ds_button_leading_icon_right_spacing}px`
    },
    '& .MuiButton-endIcon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: `${button.ds_button_trailing_icon_left_spacing}px`,
      marginRight: '0px'
    },

    '& .icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&.rotateIcon': {
        transition: 'ease-out 200ms',
        '&:hover': {
          transform: 'rotate(90deg)'
        }
      },
      '&.large': {
        fontSize: '20px',
        width: `${button.ds_button_large_icon_size}px`,
        height: `${button.ds_button_large_icon_size}px`
      },
      '&.medium': {
        fontSize: '16px',
        width: `${button.ds_button_medium_icon_size}px`,
        height: `${button.ds_button_medium_icon_size}px`
      },
      '&.small': {
        fontSize: '14px',
        width: `${button.ds_button_small_icon_size}px`,
        height: `${button.ds_button_small_icon_size}px`
      }
    }
  }
}
