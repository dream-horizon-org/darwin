import {createStyles} from '@mui/styles'
import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../theme.contants'
interface IProps {
  currentWidth: string
}

export const useStyles = makeStyles<any, IProps>((prop) =>
  createStyles({
    container: {
      width: '100%',
      position: 'relative',
      marginTop: '0px',
      marginRight: '0px'
    },
    rightDrawer: {
      position: 'fixed',
      top: '48px',
      background: aliasTokens.primary_background_color,
      height: 'calc(100% - 48px)',
      transition: 'right 100ms',
      display: 'flex'
    },
    leftMenu: {
      width: '48px',
      borderRight: `1px solid ${aliasTokens.tertiary_background_color}`,
      borderLeft: `1px solid ${aliasTokens.tertiary_background_color}`,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      '& >div': {
        // flex: '0 0 75px',
        cursor: 'pointer',
        // borderBottom: '1px solid orange',
        // height: '75px',
        // width: '75px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px'
      }
    },
    rightMenu: {
      transition: 'width 400ms',
      width: ({currentWidth}) => `${currentWidth}px`,
      // borderLeft: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      '&.bigMenu': {
        width: ({currentWidth}) => `${currentWidth}px`
      }
    },
    openDrawer: {
      right: '0px'
    },
    closeDrawer: {
      right: ({currentWidth}) => `-${currentWidth}px`
    },
    selectedIcon: {
      backgroundColor: aliasTokens.cta_primary_background_color,
      padding: '11px',
      borderRadius: '50%'
    },
    icon: {
      padding: '11px',
      '&:hover': {
        backgroundColor: aliasTokens.cta_primary_background_color,
        borderRadius: '50%'
      }
    },
    creatingClusterLoader: {
      backgroundColor: aliasTokens.cta_secondary_text_color
    }
  })
)
