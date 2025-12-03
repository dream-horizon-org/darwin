import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    searchContainer: {
      padding: '8px',
      boxShadow:
        '0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.2)'
    },
    listLabel: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px'
    },
    activeItem: {
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color
    },
    checkBoxLabel: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.active_border_color,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '160px'
    },
    filterButton: {
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      padding: '4px 8px 4px 12px',
      borderRadius: '40px',
      color: '#F5F5F5',
      textTransform: 'capitalize',
      '&.active': {
        backgroundColor: '#0074E8'
      }
    },
    actionContainer: {
      gap: '8px',
      bottom: '-8px',
      display: 'flex',
      padding: '8px',
      position: 'sticky',
      flexDirection: 'row-reverse',
      backgroundColor: aliasTokens.tertiary_background_color,
      zIndex: '10',
      width: '100%'
    }
  })

export default styles
