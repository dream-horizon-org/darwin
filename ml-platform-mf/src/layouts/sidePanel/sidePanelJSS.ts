import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    sidePanel: {
      width: '100%',
      display: 'flex',
      alignSelf: 'flex-start',

      '& > div': {
        padding: '20px',
        borderRadius: '4px',
        border: `1px solid ${aliasTokens.disabled_border_color}`,
        background: '#0224454d !important',
        boxShadow: `inset 0 0 5px ${aliasTokens.table_popin_color}`
      }
    },
    spinnerContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '300px',
      justifyContent: 'center'
    },
    detailsContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    detailsContainerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    detailsContainerHeading: {
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '24px',
      width: '196px',
      overflowWrap: 'break-word',
      marginBottom: 0,
      marginTop: '0'
    },
    detailsSection: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '24px'
    },
    detailsSectionHeading: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      color: aliasTokens.label_text_color
    },
    detailsSectionValue: {
      margin: '8px 8px 0 0',
      '& a': {
        color: aliasTokens.secondary_link_text_color
      }
    },
    detailsSectionTags: {
      '& > div': {
        margin: '8px 8px 0 0'
      }
    },
    createdOnText: {
      fontSize: '14px'
    }
  })

export default styles
