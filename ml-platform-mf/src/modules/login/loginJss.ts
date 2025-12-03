import config from 'config'
import {createUseStyles} from 'react-jss'

const useStyles = createUseStyles({
  background: {
    marginLeft: '8%',
    marginRight: '8%',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  dreamLogo: {
    width: 200,
    height: 100
  },
  googleLoginContainer: {},
  normalLoginContainer: {},
  loginHeader: {
    width: '100%',
    alignSelf: 'start',
    display: 'flex',
    flexDirection: 'column'
  },
  loginContainer: {
    padding: '32px',
    display: 'flex',
    alignItems: 'center'
  },
  loginContainerForCustom: {
    alignItems: 'center',
    display: 'flex',
    flexFlow: 'column',
    minWidth: 304,
    borderRadius: 8,
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '30px 40px'
  },
  btnAnchor: {
    textDecoration: 'none',
    color: '#ffffff'
  },
  loginForm: {
    width: '100%'
  },
  loginBtnContainer: {
    marginTop: 30,
    marginBottom: 30,
    width: '100%'
  },
  loginBtn: {
    width: '100%',
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#109e38',
    color: 'white',
    fontSize: '0.875rem',
    borderRadius: 4,
    border: 'none',
    '&:hover': {
      backgroundColor: '#109e38'
    }
  },
  imageIcon: {
    width: 24,
    height: 24,
    marginRight: 8
  },
  helpText: {
    /*  color: theme.palette.grey[400] */
  },
  salutation: {
    marginTop: '20px'
  },
  otpButton: {
    marginTop: '30px'
  },
  link: {
    /* color: theme.palette.primary.light, */
    cursor: 'pointer'
  },
  overlay: {
    filter: 'blur(5px)',
    pointerEvents: 'none'
  },
  marginTop30: {
    marginTop: '30px'
  },
  quoteContainer: {
    color: 'white',
    marginLeft: 112
  },
  quote: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 'normal'
  },
  quoteBy: {
    fontSize: 32,
    fontWeight: 500,
    lineHeight: 'normal'
  },
  gLoginText: {},
  googleBtn: {
    marginTop: 50,
    width: '100%',
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0080ff',
    borderRadius: 4
  },
  borderContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 30,
    color: '#797979',
    display: 'flex',
    alignItems: 'center'
  },
  border: {
    border: '1px solid #797979',
    width: '50%',
    height: 0
  },
  borderText: {
    paddingLeft: 8,
    paddingRight: 8
  },
  root: {
    '& label.Mui-focused': {
      color: '#ffffff'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#4d4d4d'
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#4d4d4d'
      },
      '&:hover fieldset': {
        borderColor: '#4d4d4d'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4d4d4d'
      }
    },
    color: '#ffffff',
    '& .MuiInputBase-input': {
      color: '#ffffff'
    }
  },
  textFieldLabel: {},
  usernameField: {marginTop: 0, marginBottom: 0},
  passwordField: {
    marginTop: 30,
    marginBottom: 0
  },
  usernameContainer: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  },
  loaderActive: {
    pointerEvents: 'none'
  },
  disableButton: {
    pointerEvents: 'none'
  },
  loginContent: {
    backgroundImage: `url(${config.cfMsdAssetUrl}/images/msd_background.png)`,
    backgroundSize: 'cover',
    flexGrow: 1,
    display: 'flex',
    height: '100%'
  },
  materialTextfield: {
    display: 'flex',
    flex: '1',
    position: 'relative'
  },
  label: {
    position: 'absolute',
    fontSize: '1rem',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '0 0.3rem',
    margin: '0 0.5rem',
    transition: '.1s ease-out',
    transformOrigin: 'left top',
    pointerEvents: 'none'
  },
  input: {
    fontSize: '1rem',
    outline: 'none',
    border: '1px solid gray',
    borderRadius: '5px',
    padding: '16px 12px',
    color: 'white',
    transition: '0.1s ease-out',
    backgroundColor: 'transparent',
    width: '100%',
    '&:focus': {
      borderColor: 'white'
    },
    '&:focus + label': {
      color: 'white',
      top: 0,
      transform: 'translateY(-50%) scale(.9)'
    },
    '&:not(:placeholder-shown) + label': {
      top: 0,
      transform: 'translateY(-50%) scale(.9)'
    }
  },
  errorText: {
    color: 'red',
    fontSize: '12px',
    padding: '4px 0px',
    height: '16px'
  },
  '@media screen and (max-width: 768px)': {
    loginContainerForCustom: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backdropFilter: 'blur(0px)',
      flex: '1',
      borderRadius: 0,
      padding: '0px 28px',
      marginTop: ''
    },
    background: {
      alignItems: 'flex-start',
      marginLeft: 0,
      marginRight: 0
    },
    dreamLogo: {
      paddingTop: 58
    },
    loginContent: {
      backgroundPosition: 'center bottom',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundColor: '#000000',
      backgroundImage: `url(${config.cfMsdAssetUrl}/images/login_bg_mobile.png)`
    },
    borderContainer: {
      marginTop: 0,
      marginBottom: 0
    },
    googleBtn: {
      marginTop: 32
    },
    quoteContainer: {
      display: 'none'
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column-reverse',
      marginTop: 66
    },
    googleLoginContainer: {
      display: 'flex',
      flexDirection: 'column-reverse'
    }
  }
})

export default useStyles
