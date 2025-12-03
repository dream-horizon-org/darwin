import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'

const styles = createStyles({
  container: {
    width: '100%',
    height: '4px',
    position: 'relative',
    background:
      'linear-gradient(90deg, rgba(15,150,76,1) 0%, rgba(235,203,36,1) 50%, rgba(225,0,0,1) 100%)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  usedSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    background: 'transparent'
  },

  unusedSection: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    background: aliasTokens.tertiary_background_color
  }
})
export default styles
