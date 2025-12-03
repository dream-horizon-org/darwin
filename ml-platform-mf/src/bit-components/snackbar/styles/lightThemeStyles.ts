import {alert as alertTheme} from '../../design-tokens/index'

export const stylesLightTheme = () => {
  const alert = alertTheme('light')

  return {
    '&.snackbar': {
      position: 'absolute',
      maxWidth: '800px',
      width: 'max-content',
      '& .MuiAlert-message': {
        fontSize: '14px',
        fontWeight: 400,
        fontFamily: 'Roboto',
        color: alert.alert.snackbar.text.ds_snackbar_text_color,
        lineHeight: '20px',
        textWrap: 'wrap',
        display: 'flex',
        alignItems: 'center',
        padding: '0px',
        marginRight: `${alert.ds_ticker_horizontal_spacing}px`
      },

      '&.success': {
        '& .MuiPaper-root': {
          background:
            alert.alert.snackbar.background.ds_snackbar_success_background_color
        },
        '& .icon::before ': {
          color: `${alert.alert.snackbar.icon.ds_snackbar_success_icon_color}`
        }
      },
      '&.information': {
        '& .MuiPaper-root': {
          background:
            alert.alert.snackbar.background
              .ds_snackbar_information_background_color
        },
        '& .icon::before  ': {
          color: `${alert.alert.snackbar.icon.ds_snackbar_information_icon_color}`
        }
      },
      '&.warning': {
        '& .MuiPaper-root': {
          background:
            alert.alert.snackbar.background.ds_snackbar_warning_background_color
        },
        '& .icon::before  ': {
          color: `${alert.alert.snackbar.icon.ds_snackbar_warning_icon_color}`
        }
      },
      '&.failure': {
        '& .MuiPaper-root': {
          background:
            alert.alert.snackbar.background.ds_snackbar_error_background_color
        },
        '& .icon::before  ': {
          color: `${alert.alert.snackbar.icon.ds_snackbar_error_icon_color}`
        }
      },
      '& .MuiAlert-icon': {
        padding: '0px',
        width: `${alert.ds_snackbar_icon_size}px`,
        height: `${alert.ds_snackbar_icon_size}px`,
        marginRight: `${alert.ds_snackbar_icon_right_spacing}px`
      },
      '& .MuiPaper-root': {
        padding: `${alert.ds_snackbar_vertical_spacing}px ${alert.ds_snackbar_horizontal_spacing}px`,
        borderRadius: `${alert.ds_snackbar_radius}px`,
        alignItems: 'center'
      },
      '& .MuiButton-root': {
        '&.showButton': {
          display: 'flex'
        },
        '&.hideButton': {
          display: 'none'
        }
      },
      '& .showButton': {
        '& .MuiButton-root': {
          marginRight: `${alert.ds_snackbar_text_button_right_spacing}px`
        }
      },
      '& .MuiAlert-action': {
        height: `${alert.ds_snackbar_icon_size}px`,
        display: 'flex',

        padding: '0px',
        marginRight: '0px',
        alignItems: 'center'
      }
    },
    '& .closeIcon': {
      fontSize: `${alert.ds_snackbar_icon_size}px`,
      marginLeft: '16px',
      cursor: 'pointer'
    },

    '& .icon': {
      fontSize: `${alert.ds_snackbar_icon_size}px`
    },
    '&.alert': {
      width: '100%'
    }
  }
}
