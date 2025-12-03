import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../../../../theme.contants'

export const styles = makeStyles(() => ({
  source: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '28px',

    '&:first-of-type': {
      marginTop: 0
    }
  },
  sourceType: {
    display: 'flex',
    alignItems: 'center',
    width: '10%'
  },
  sourceLabel: {
    marginLeft: 10
  },
  sourceLocation: {
    display: 'flex',
    flexDirection: 'column'
  },
  sourceLocationLabel: {
    color: aliasTokens.tertiary_text_color,
    marginBottom: 4
  },
  sourceReferenceName: {
    display: 'flex',
    flexDirection: 'column',
    width: '15%'
  },
  sourceReferenceNameLabel: {
    color: aliasTokens.tertiary_text_color,
    marginBottom: 4
  },
  sourceAction: {
    display: 'flex',
    flexDirection: 'column',
    width: '15%'
  }
}))
