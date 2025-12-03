import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'

const styles = createStyles({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    width: 'calc(100% - 48px)',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: '20px 24px',
    background: aliasTokens.secondary_background_color,
    boxSizing: 'border-box',
    position: 'fixed',
    top: '48px',
    left: '48px',
    zIndex: 10
  },
  left: {
    fontWeight: 700,
    fontSize: '24px',
    color: aliasTokens.neutral_text_color
  },
  right: {
    display: 'flex'
  },
  searchContainer: {
    width: '305px'
  },
  btnContainer: {
    marginLeft: '12px'
  }
})

export default styles
