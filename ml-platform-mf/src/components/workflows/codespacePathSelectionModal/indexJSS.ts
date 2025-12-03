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
    runStatus: {
      width: '24px'
    },
    successIcon: {
      color: aliasTokens.success_icon_color
    },
    errorIcon: {
      color: aliasTokens.warning_red_icon_color
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
    modalContainer: {
      border: `1px solid ${aliasTokens.disabled_border_color}`
    },
    modalGridContainer: {
      display: 'flex',
      overflowX: 'auto' /* Enable horizontal scrolling */,
      whiteSpace: 'nowrap' /* Prevent items from wrapping to the next line */,
      width: 'calc(100vw - 20vw)',
      height: 'calc(100vh - 30vh)',
      scrollBehavior: 'smooth'
    },
    modalGridItem: {
      boxSizing: 'border-box',
      borderLeft: `1px solid ${aliasTokens.disabled_border_color}`,
      flex: '1 0 25%',
      display: 'flex',
      flexDirection: 'column'
    },
    selectedPath: {
      margin: '20px 0',
      height: '20px',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    breadCrumbContainer: {
      width: 'fit-content',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: '2px',
      columnGap: '2px'
    },
    breadcrumbElement: {
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    pathTitle: {
      background: aliasTokens.secondary_background_color,
      fontWeight: 700,
      color: aliasTokens.neutral_text_color,
      fontSize: '14px',
      lineHeight: '20px',
      flex: '0 0 30px',
      padding: '4px 20px',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    fileListContainer: {
      padding: '12px',
      margin: '0',
      overflowY: 'auto'
    },
    folderListItemContainer: {
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      color: aliasTokens.neutral_text_color,
      '&.selected': {
        background: aliasTokens.cta_disabled_secondary_background_color,
        borderRadius: '4px'
      }
    },
    listItemIcon: {},
    listItemText: {
      marginLeft: '8px',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px'
    }
  })

export default styles
