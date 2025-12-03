import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    titleHeader: {
      minHeight: '112px',
      background: aliasTokens.secondary_background_color,
      display: 'flex',
      margin: '-16px -16px 0px -16px',
      paddingRight: '24px'
    },
    pageActions: {
      display: 'flex',
      marginTop: '16px',
      padding: '0 24px'
    },
    titleContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginTop: '24px'
    },
    titleDescription: {
      display: 'flex',
      alignItems: 'center',

      '& >div': {
        borderLeft: `1px solid ${aliasTokens.disabled_border_color}`
      }
    },
    title: {
      borderLeft: 'none !important',
      // flex: '0 0 25%',
      // minWidth: '240px',
      maxWidth: '260px'
      // '& span': {
      //   fontWeight: '700',
      //   fontSize: '18px',
      //   lineHeight: '24px',
      // }

      // '& input': {
      //   fontStyle: 'normal',
      //   fontWeight: '700',
      //   fontSize: '18px',
      //   lineHeight: '24px',
      //   '&::-webkit-input-placeholder': {
      //     fontWeight: 'normal'
      //   }
      // }
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
    },
    actionContainer: {
      display: 'flex',
      marginTop: '24px'
    },
    statusItem: {
      padding: '0px 24px',
      height: '20px',
      display: 'flex',
      alignItems: 'center'
    },
    ownerWrapper: {
      padding: '0px 24px',
      color: aliasTokens.tertiary_text_color,
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px'
    },
    ownerItem: {
      color: aliasTokens.neutral_text_color
    }
  })

export default styles
