import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    parameterContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: '28px'
    },
    parameterDataContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      marginTop: '16px',
      width: '50%'
    },
    parameterHeadingLabel: {
      fontFamily: 'Roboto',
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0px'
    },
    parametersDataValue: {
      fontFamily: 'Roboto',
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0px'
    }
  })

export default styles
