import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    taskDetailsHeader: {
      display: 'flex',
      padding: '20px 16px',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`,
      alignItems: 'center'
    },
    closeIcon: {
      width: '24px'
    },
    taskDetailsTitle: {
      fontSize: '16px',
      fontWeight: 700,
      marginLeft: '16px'
    },
    retriesSelectionContainer: {
      marginLeft: '16px',
      '& .MuiInputBase-inputSizeSmall': {
        display: 'flex',
        alignItems: 'center'
      }
    },
    retriesSelectionDropdown: {
      width: '324px',
      fontSize: '14px',
      fontWeight: 400
    },
    menuItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: 400,

      '&:hover': {
        backgroundColor: aliasTokens.tertiary_background_color
      },

      '&.Mui-selected': {
        backgroundColor: aliasTokens.tertiary_background_color,
        '&:hover': {
          backgroundColor: aliasTokens.tertiary_background_color
        }
      }
    },
    left: {
      flex: 1,
      display: 'flex'
    },
    right: {},
    duration: {
      marginLeft: '2px'
    }
  })

export default styles
