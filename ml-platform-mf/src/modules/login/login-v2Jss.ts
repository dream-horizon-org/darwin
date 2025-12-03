import config from 'config'
import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../theme.contants'

const useStyles = createUseStyles({
  loginWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    backgroundSize: 'cover',
    backgroundImage: `url(${config.cfMsdAssetUrl}/images/darwinBackgroundImage.png)`
  },
  loginWrapperContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '44px 36px',
    width: '501px',
    minHeight: '304px',
    background: '#252525',
    border: '1px solid rgba(104, 104, 104, 0.7)',
    backdropFilter: 'blur(15px)',
    borderRadius: '8px',
    height: 'fit-content'
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logo1: {},
  logo2: {
    marginTop: '34px'
  },
  subHeading: {
    fontWeight: '400',
    fontSize: '16px',
    lineHeight: '20px',
    textAlign: 'center',
    color: aliasTokens.tertiary_text_color,
    marginTop: '18px'
  },
  loginButtonContainer: {
    width: '100%'
  },
  loginButton: {
    minWidth: '280px',
    height: '44px',
    display: 'flex',
    background: '#0074E8',
    padding: '8px',
    marginTop: '32px',
    borderRadius: '4px',
    alignItems: 'center',
    justifyContent: 'center',
    '& >img': {
      height: '24px',
      width: '24px'
    },
    '& >span': {
      fontWeight: '500',
      fontSize: '16px',
      lineHeight: '20px',
      textAlign: 'center',
      color: aliasTokens.base_text_color,
      marginLeft: '4px'
    }
  },
  googleLoginBtn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '30px'
  }
})

export default useStyles
