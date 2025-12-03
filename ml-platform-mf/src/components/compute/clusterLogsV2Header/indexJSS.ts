import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    left: {
      width: '348px',
      display: 'flex',
      '& > div': {
        width: '100%'
      }
    },
    right: {
      width: '50%',
      display: 'flex',
      justifyContent: 'flex-end'
    },
    filterContainer: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '24px',
      gap: '8px'
    },
    sectionTitle: {
      color: aliasTokens.label_text_color_new,
      fontSize: '14px',
      fontWeight: 400
    }
  })

export default styles
