import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      padding: '0 24px'
      // height: '100%'
    },
    header: {
      display: 'flex',
      alignItems: 'center'
    },
    weekFilterTitle: {
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.tertiary_text_color
    },
    weekFilterDropdown: {
      marginLeft: '16px'
    },
    section: {
      marginTop: '24px',
      height: '100%',
      maxHeight: 'calc(100vh - 324px)',

      '& .MuiTableRow-root': {
        cursor: 'pointer'
      }
    },
    runDetailsHeading: {
      width: 'fit-content',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: aliasTokens.primary_text_color,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      marginBottom: '12px',
      '& >span': {
        marginRight: '4px'
      }
    },
    runDetailsContainer: {
      height: 'calc(100vh - 284px)',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '4px'
    },
    actionIcon: {
      width: '16px'
    },
    workflowRepairBar: {
      marginTop: '-8px',
      marginBottom: '-8px'
    },
    workflowRunRepairBar: {
      marginTop: '12px',
      marginBottom: '12px'
    },
    workflowDetailsStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    workflowRunDuration: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
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
      width: '16px',
      height: '16px'
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
    }
  })

export default styles
