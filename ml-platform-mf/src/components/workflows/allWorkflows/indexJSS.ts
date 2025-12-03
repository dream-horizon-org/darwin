import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '36px',
      scrollMargin: '160px'
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    title: {
      fontWeight: 700,
      fontSize: '14px'
    },
    total: {
      padding: '2px 8px',
      backgroundColor: aliasTokens.surface_background_color,
      marginLeft: '8px',
      color: aliasTokens.secondary_text_color,
      fontWeight: 700,
      fontSize: '12px',
      borderRadius: '2px'
    },
    right: {
      display: 'flex',
      alignItems: 'center'
    },
    filterByText: {
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '14px'
    },
    workflowDescription: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '12px',
      fontWeight: 400
    },
    workflowName: {
      fontSize: '14px',
      fontWeight: 700
    },
    dataList: {
      marginTop: '16px',

      '& .MuiTableRow-root': {
        cursor: 'pointer'
      }
    },
    marginTags: {
      display: 'flex',
      '& > div': {
        marginLeft: '8px',
        '&:first-of-type': {
          marginLeft: 0
        }
      }
    },
    showMore: {
      marginLeft: '8px',
      fontSize: '12px',
      fontWeight: 400,
      color: aliasTokens.cta_secondary_text_color,
      cursor: 'pointer'
    },
    moreIcon: {
      cursor: 'pointer'
    },
    actionName: {
      fontSize: '14px',
      fontWeight: 400,
      marginLeft: '8px'
    },
    actionIcon: {
      width: '16px'
    },
    lastRunDetails: {
      display: 'flex'
    },
    workflowIconContainer: {
      position: 'relative',
      marginRight: '12px'
    },
    timeExceededIcon: {
      position: 'absolute',
      top: '-4px',
      right: '-4px'
    },
    runStatus: {
      width: '24px'
    },
    successIcon: {
      color: aliasTokens.success_icon_color
    },
    errorIcon: {
      color: aliasTokens.warning_red_icon_color
    },
    disabledIcon: {
      color: aliasTokens.disabled_icon_color
    },
    skippedIcon: {
      color: aliasTokens.disabled_icon_color
    },
    iconDimension: {
      width: '24px',
      height: '24px'
    },
    filterContainer: {
      display: 'flex'
    },
    loader: {},
    runStatusAlignment: {
      marginLeft: '16px',
      '&:first-child': {
        marginLeft: 0
      }
    },
    loaderContainer: {
      margin: '24px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default styles
