import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    titleContainer: {
      display: 'flex',
      flexDirection: 'column'
    },
    titleDescription: {
      display: 'flex',
      alignItems: 'center'
    },
    title: {
      maxWidth: '500px'
    },
    titleName: {
      fontWeight: '700',
      fontSize: '18px',
      lineHeight: '24px',
      color: aliasTokens.neutral_text_color,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      paddingRight: '24px'
    },
    tagsRow: {
      padding: '16px 0px'
    },
    tagsRowChip: {
      paddingRight: '4px'
    },
    addTagBtn: {
      cursor: 'pointer',
      color: aliasTokens.tertiary_text_color,
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      marginLeft: '20px'
    }
  })

export default styles
