import {createStyles} from '@mui/styles'
import {COLORS, Typography} from '../../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '40px 148px 0px 148px',
    boxSizing: 'border-box'
  },
  headerContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: '24px'
  },
  runtimeName: Typography.is('heading2')
    .with({
      marginLeft: '16px'
    })
    .toCSS(),
  refreshContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 'auto',
    columnGap: '24px'
  },
  lastUpdatedText: Typography.is('body2')
    .with({
      color: COLORS.NEUTRAL[50]
    })
    .toCSS(),
  iconContainer: {
    width: 'fit-content',
    height: 'fit-content',

    '& .icon': {
      '&:before': {
        color: `${COLORS.NEUTRAL[20]} !important`
      }
    }
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexGrow: '1',
    backgroundColor: COLORS.NEUTRAL[100],
    borderRadius: '8px',
    padding: '16px'
  },
  contentContainerHeader: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: '16px',
    color: COLORS.NEUTRAL[20],
    margin: '0px',
    marginBottom: '12px'
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: '1',
    backgroundColor: COLORS.NEUTRAL[110],
    borderRadius: '8px'
  },
  editorContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexGrow: '1',
    paddingTop: '16px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    backgroundColor: COLORS.NEUTRAL[110]
  }
})

export default styles
