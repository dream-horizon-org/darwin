import {SxProps} from '@mui/material'
import {alert as alertTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  const alert = alertTheme('dark')
  return {
    '& .banner': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${alert.ds_ticker_vertical_spacing}px ${alert.ds_snackbar_horizontal_spacing}px`,
      minHeight: '24px',
      gap: `${alert.ds_ticker_horizontal_spacing}px`,
      '&.success': {
        background:
          alert.alert.ticker.background.ds_ticker_success_background_color,
        '& .leadingIcon::before': {
          color: alert.alert.ticker.icon.ds_ticker_success_icon_color
        }
      },
      '&.information': {
        background:
          alert.alert.ticker.background.ds_ticker_information_background_color,
        '& .leadingIcon::before': {
          color: alert.alert.ticker.icon.ds_ticker_information_icon_color
        }
      },
      '&.warning': {
        background:
          alert.alert.ticker.background.ds_ticker_warning_background_color,
        '& .leadingIcon::before': {
          color: alert.alert.ticker.icon.ds_ticker_warning_icon_color
        }
      },
      '&.failure': {
        background:
          alert.alert.ticker.background.ds_ticker_error_background_color,
        '& .leadingIcon::before': {
          color: alert.alert.ticker.icon.ds_ticker_error_icon_color
        }
      },
      '& .MuiTypography-root': {
        display: 'flex',
        alignItems: 'center',
        color: alert.alert.ticker.text.ds_ticker_text_color,
        lineHeight: '20px',
        textWrap: 'wrap'
      }
    },
    '& .bannerContent, .bannerRightContent': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    '& .hideBanner': {
      display: 'none'
    },
    '& .button': {
      background: 'transparent',
      border: 'none',
      marginLeft: '16px',
      color: '#D9D9D9',
      padding: '0px'
    },
    '& .hideButton': {
      display: 'none'
    },
    '& .leadingIcon': {
      height: '24px',
      width: '24px',
      fontSize: '24px'
    },
    '& .textField': {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: '400',
      color: '#D9D9D9'
    },
    '& .trailingIcon': {
      cursor: 'pointer',
      height: '24px',
      width: '24px',
      marginLeft: '12px',
      fontSize: '24px'
    }
  }
}

export const typographyDarkStyles: SxProps = () => {
  return {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400'
    }
  }
}
