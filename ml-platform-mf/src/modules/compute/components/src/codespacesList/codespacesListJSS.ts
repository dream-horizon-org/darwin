import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'
import {Typography} from '../../../../../themes'

const styles = createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  tableText: Typography.is('body2').toCSS(),
  tableTextBlue: Typography.is('body2')
    .with({
      color: aliasTokens.cta_secondary_text_color
    })
    .toCSS(),
  emptyStateContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    border: `1px solid ${aliasTokens.disabled_border_color}`,
    borderRadius: '8px'
  },
  emptyStateTitle: Typography.is('heading3')
    .with({
      marginTop: '12px'
    })
    .toCSS()
})

export default styles
