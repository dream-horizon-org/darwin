import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../theme.contants'

export const useStyles = createUseStyles({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 48,
    background: '#1a1a1a',
    borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  menuIcon: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '4px'
  },
  logoImageDesktop: {
    paddingLeft: '24px'
  },
  logo: {
    width: '242px',
    alignSelf: 'center',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '24px'
  },
  shield: {
    color: '#ffffff',
    fontSize: '24px',
    lineHeidht: '28px',
    paddingLeft: '10px',
    fontWeight: 700
  },
  logoImage: {
    width: 100,
    height: 32,
    boxSizing: 'border-box'
  },
  appContextContainer: {
    alignSelf: 'center',
    marginLeft: 16
  },
  gameContextContainer: {
    alignSelf: 'center',
    marginLeft: 16
  },
  menuToggleButton: {
    padding: '0 8px 4px 16px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  logoutIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginRight: '24px',
    width: '24px'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    color: '#ffffff',
    fontSize: 20
  },
  shieldIcon: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '24px',
    alignSelf: 'right',
    cursor: 'pointer',
    width: '24px'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  headerStaticLink: {
    color: aliasTokens.primary_text_color,
    fontWeight: 700,
    fontSize: '14px',
    lineHeight: '20px',
    marginRight: '32px'
  }
})
