import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../theme.contants'

export const linkJss = makeStyles({
  link: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  defaultFont: {
    fontSize: 12
  },
  bigFont: {
    fontSize: 14
  },
  highlightColor: {
    color: aliasTokens.secondary_link_text_color
  },
  defaultColor: {
    color: aliasTokens.primary_text_color
  }
})
