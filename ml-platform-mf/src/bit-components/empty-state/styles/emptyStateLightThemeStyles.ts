import {createUseStyles} from 'react-jss'
import {empty_state as emptyStateTheme} from '../../design-tokens/index'

export const stylesLightTheme = () => {
  const emptyStateDesignSet = emptyStateTheme('light')
  return createUseStyles({
    container: {
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: '400',
      minWidth: '222px',
      gap: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '& img': {
        '&.large': {
          width: '100px',
          height: '100px'
        },
        '&.small': {
          width: '72px',
          height: '72px'
        }
      }
    },
    title: {
      '&.MuiTypography-root': {
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 700,
        lineHeight: '24px',
        color: emptyStateDesignSet.empty_state.text.ds_empty_title_text_color
      }
    },
    subTitle: {
      '&.MuiTypography-root': {
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        paddingTop: '4px',
        color: emptyStateDesignSet.empty_state.text.ds_empty_subbtext_text_color
      }
    }
  })
}

export default stylesLightTheme
