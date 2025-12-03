import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../../theme.contants'
import {COLORS, Typography} from '../../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '40px 148px 0px 148px',
    boxSizing: 'border-box'
  },
  headerContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: '24px'
  },
  pageTitle: Typography.is('heading2')
    .with({
      marginLeft: '16px'
    })
    .toCSS(),
  iconContainer: {
    width: 'fit-content',
    height: 'fit-content',

    '& .icon': {
      '&:before': {
        color: `${COLORS.NEUTRAL[20]} !important`
      }
    }
  },
  contentContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    rowGap: '24px',
    padding: '24px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    border: `1px solid ${aliasTokens.disabled_border_color}`,
    position: 'relative',
    overflow: 'hidden'
  },
  footerContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '16px',
    padding: '16px 24px',
    boxSizing: 'border-box',
    backgroundColor: aliasTokens.tertiary_background_color,
    position: 'fixed',
    bottom: '0px',
    left: '0px'
  },
  runtimeNameContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  runtimeNameLabel: Typography.is('heading4')
    .with({
      marginBottom: '12px'
    })
    .toCSS(),
  errorText: Typography.is('body1')
    .with({
      color: aliasTokens.error_text_color,
      marginTop: '4px'
    })
    .toCSS(),

  formErrorContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    backgroundColor: aliasTokens.error_background_color,
    padding: '8px 12px',
    boxSizing: 'border-box'
  },
  errorIcon: {
    height: '24px',
    width: '24px',
    color: aliasTokens.warning_red_icon_color
  },
  formErrorText: Typography.is('body2')
    .with({
      merginLeft: '8px'
    })
    .toCSS(),
  closeIcon: {
    height: '16px',
    width: '16px',
    color: aliasTokens.neutral_text_color,
    cursor: 'pointer',
    marginLeft: 'auto'
  }
})

export default styles
