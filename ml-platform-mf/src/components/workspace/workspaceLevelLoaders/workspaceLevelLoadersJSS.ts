import {createStyles} from '@mui/material'
import config from 'config'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      background: '#000000b5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url(${config.cfMsdAssetUrl}/images/workspace-background.png)`,
      backgroundSize: 'cover'
    },
    mainData: {
      display: 'flex',
      flexDirection: 'column',
      margin: 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      '& >span': {
        fontSize: '40px'
      }
    },
    header: {
      marginTop: '12px',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      textAlign: 'center',
      color: aliasTokens.secondary_text_color
    },
    info: {
      marginTop: '4px',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      textAlign: 'center',
      color: aliasTokens.tertiary_text_color
    }
  })

export default styles
