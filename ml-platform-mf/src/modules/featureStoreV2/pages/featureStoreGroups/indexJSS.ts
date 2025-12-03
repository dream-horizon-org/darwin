import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      width: 'calc(100% + 32px)',
      margin: '-16px'
    },
    pageTitle: {
      fontWeight: 600,
      fontSize: '24px',
      lineHeight: '32px',
      color: aliasTokens.neutral_text_color
    },
    loader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardsContainer: {
      overflow: 'auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      columnGap: '24px',
      rowGap: '24px',
      padding: '0px 2px 24px 2px'
    },
    placeholder: {
      minHeight: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    endDivider: {
      flex: 1,
      color: aliasTokens.tertiary_text_color,
      maxWidth: '400px',
      '&:before': {
        borderTopColor: aliasTokens.tertiary_text_color
      },
      '&:after': {
        borderTopColor: aliasTokens.tertiary_text_color
      }
    }
  })

export default styles
