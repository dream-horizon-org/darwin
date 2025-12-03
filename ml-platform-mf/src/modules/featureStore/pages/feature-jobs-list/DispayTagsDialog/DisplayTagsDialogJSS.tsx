import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../../theme.contants'

const styles = () =>
  createStyles({
    tagHeader: {
      display: 'flex',
      width: '100%',
      backgroundColor: aliasTokens.tertiary_background_color
    },
    dialogTitle: {
      width: '100%'
    },
    tagsHeaderContent: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    tagTitleHeading: {
      margin: 0
    },
    tagDialogCloseIcon: {
      cursor: 'pointer'
    },
    tag: {
      marginLeft: '1rem',
      '&:first-child': {
        marginLeft: '0'
      }
    },
    tagsContent: {
      paddingTop: '1rem',
      paddingBottom: '1rem',
      display: 'flex'
    }
  })

export default styles
