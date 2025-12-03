import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../theme.contants'

export const breadcrumbJss = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  currentLink: {
    fontWeight: 700,
    color: aliasTokens.primary_text_color
  },
  linkContainer: {
    display: 'flex'
  }
})
