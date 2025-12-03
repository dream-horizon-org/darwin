import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    tags: {
      display: 'flex'
    },
    moreTags: {
      marginLeft: '1rem',
      cursor: 'pointer',
      color: aliasTokens.secondary_link_text_color
    },
    tag: {
      marginLeft: '1rem',
      '&:first-child': {
        marginLeft: '0'
      },
      alignSelf: 'center'
    },
    activeButton: {
      backgroundColor: aliasTokens.success_background_color
    },
    inActiveButton: {
      backgroundColor: aliasTokens.error_background_color
    },
    expandIcon: {
      cursor: 'pointer'
    }
  })

export default styles
