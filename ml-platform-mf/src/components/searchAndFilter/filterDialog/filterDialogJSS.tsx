import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    dialogTitle: {
      width: '100%'
    },
    filterHeader: {
      display: 'flex',
      width: '100%',
      backgroundColor: aliasTokens.tertiary_background_color
    },
    filterTitleHeading: {
      margin: 0
    },
    filterHeaderContent: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    filterDialogCloseIcon: {
      cursor: 'pointer'
    },
    tagsList: {
      marginTop: '2rem'
    },
    tagListGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr);'
    },
    viewMoreTags: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
      cursor: 'pointer',
      margin: '1rem 0'
    },
    ownerList: {
      marginTop: '2rem'
    },
    ownerListGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr);'
    },
    divider: {
      background: aliasTokens.surface_background_color
    }
  })

export default styles
