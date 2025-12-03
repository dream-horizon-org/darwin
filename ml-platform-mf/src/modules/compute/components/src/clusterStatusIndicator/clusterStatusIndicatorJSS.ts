import {createStyles} from '@mui/styles'
import {Typography} from '../../../../../themes'

const styles = createStyles({
  container: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '8px'
  },
  clusterStatusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  clusterStatusText: Typography.is('body1').toCSS()
})

export default styles
