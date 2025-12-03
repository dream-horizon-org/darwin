import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../../../theme.contants'

export const styles = makeStyles(() => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '32px'
  },
  actionButtonsWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  historyIconWrapper: {
    borderRadius: 4,
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${aliasTokens.cta_secondary_text_color}`,
    height: 40,
    width: 40,
    '&>svg': {
      fill: aliasTokens.cta_secondary_text_color
    }
  },
  versionTag: {
    display: 'flex',
    marginLeft: 12
  },
  versionStatus: {
    display: 'flex',
    marginLeft: 12,
    alignItems: 'center'
  },
  activeCircle: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: aliasTokens.active_background_color
  },
  activeCircleLable: {
    fontSize: '12px',
    fontWeight: 'normal',
    marginLeft: '5px',
    color: aliasTokens.active_background_color
  },
  inactiveCircle: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: aliasTokens.error_border_color
  },
  inactiveCircleLable: {
    fontSize: '12px',
    fontWeight: 'normal',
    marginLeft: '5px',
    color: aliasTokens.error_border_color
  }
}))
