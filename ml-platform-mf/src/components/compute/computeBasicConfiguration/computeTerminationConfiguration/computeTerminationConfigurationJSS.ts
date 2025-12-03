import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      marginTop: '18px'
    },
    terminateClusterInputContainer: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0 0 10px',
      color: aliasTokens.tertiary_text_color
    },
    inactiveTimeInput: {
      margin: '0 3px',
      width: '72px',
      display: 'flex',
      alignItems: 'center',

      '& p.MuiFormHelperText-root': {
        margin: 0
      }
    },
    percentSign: {
      marginLeft: '2px'
    },
    autoTerminateParams: {},
    autoTerminateParamContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '12px'
    },
    headAndWorkderNodeConfigsContainer: {
      display: 'flex',
      marginLeft: '24px',
      color: aliasTokens.tertiary_text_color,
      padding: '4px',
      backgroundColor: aliasTokens.secondary_background_color,
      borderRadius: '4px'
    },
    headAndWorkderNodeConfigs: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '32px',

      '&:first-of-type': {
        marginLeft: '0'
      }
    },
    accordion: {
      marginTop: '24px'
    },
    accordionSummary: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between'
    },
    accordionDetails: {
      paddingTop: '0'
    },
    terminateClusterName: {
      color: aliasTokens.tertiary_text_color
    },
    radioContainer: {
      display: 'flex',
      gap: '16px'
    }
  })

export default styles
