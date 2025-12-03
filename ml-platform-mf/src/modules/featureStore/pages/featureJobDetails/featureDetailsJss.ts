import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../theme.contants'

export const styles = makeStyles(() => ({
  pageContent: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.25rem 0.5rem',
    margin: '0 auto 20px'
  },
  actionsContainer: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  linkContainer: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  bottomContainer: {
    position: 'fixed',
    left: 242,
    zIndex: 3,
    width: 'calc(100% - 242px)',
    height: 90,
    display: 'flex',
    bottom: 0,
    margin: '0 auto',
    marginTop: '20px',
    alignItems: 'center',
    background: aliasTokens.secondary_background_color
  },
  submitButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0 24px',
    justifyContent: 'flex-end',
    margin: '0 auto'
  },
  cancelBtn: {
    marginRight: 20
  },
  statusWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lens: {
    marginRight: 4
  },
  statusEnabled: {
    '&>svg': {
      color: aliasTokens.success_icon_color
    },
    '&>span': {
      color: aliasTokens.success_text_color
    }
  },
  statusDisabled: {
    '&>svg': {
      color: aliasTokens.disabled_icon_color
    },
    '&>span': {
      color: aliasTokens.disabled_text_color
    }
  },
  textInput: {
    width: 76,
    '&>div': {
      fontSize: '0.875rem'
    }
  },
  total: {
    fontWeight: 'bold',
    fontSize: '0.875rem'
  },
  statusToggle: {
    alignItems: 'center',
    '&>label': {
      marginRight: 0,
      '&>span': {
        fontSize: '0.875rem'
      }
    }
  }
}))
