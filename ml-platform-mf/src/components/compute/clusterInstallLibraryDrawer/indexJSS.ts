import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    createDrawer: {
      width: '50%'
    },
    datatable: {
      height: 'calc(100vh - 200px)'
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: aliasTokens.secondary_background_color
    },
    drawerWrapper: {
      borderRadius: '0px'
    },
    header: {
      height: '64px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(51, 51, 51, 0.6)',
      position: 'sticky',
      top: 0,
      zIndex: 1
    },
    headerIcon: {},
    headerContent: {
      paddingLeft: '16px',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color
    },
    contentContainer: {
      padding: '24px',
      flex: 1
    },
    footer: {
      height: '72px',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'row-reverse',
      background: 'rgba(51, 51, 51, 0.6)',
      alignItems: 'center',
      gap: '16px',
      position: 'sticky',
      bottom: 0,
      zIndex: 1
    },
    workspaceHeading: {
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0%',
      marginBottom: '8px'
    },
    radioButton: {
      display: 'flex',
      flexDirection: 'row',
      '& > label': {
        marginRight: '24px',
        '&:first-child': {
          marginLeft: '0px'
        },
        '&:last-child': {
          marginRight: '0px'
        }
      },
      marginBottom: '8px'
    },
    inputFields: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '31px'
    },
    inputPathInfo: {
      fontWeight: '400',
      color: aliasTokens.tertiary_text_color,
      marginBottom: '8px',
      fontSize: '14px'
    },
    infoIcon: {
      color: aliasTokens.info_purple_icon_color,
      width: '24px',
      height: '24px',
      marginRight: '8px'
    },
    infoText: {
      flexWrap: 'wrap',
      fontSize: '16px'
    },
    info: {
      display: 'flex',
      alignItems: 'center'
    },
    closeButton: {
      marginLeft: '8px',
      cursor: 'pointer'
    },
    learnMoreText: {
      padding: '4px 8px',
      fontWeight: '700',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px',
      cursor: 'pointer'
    },
    closeContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    inputWithInfoMessage: {
      display: 'flex',
      alignItems: 'center',

      '& .MuiFormHelperText-root': {
        color: `${aliasTokens.duration_warning_text_color}`
      }
    },
    packageField: {
      marginBottom: '16px',
      marginTop: '31px'
    },
    s3Heading: {
      marginTop: '31px'
    },
    libraryTypeButton: {
      marginBottom: '16px'
    },
    mavenContainer: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: '31px',
      gap: '8px'
    },
    mavenInputField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%'
    },
    mavenRepository: {
      marginBottom: '16px'
    },
    mavenSearchBar: {
      marginBottom: '16px'
    },
    noResultsBox: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80%'
    },
    sourceHeading: {
      marginBottom: '8px'
    },
    infoMessage: {
      color: aliasTokens.tertiary_text_color,
      marginLeft: '4px',
      fontSize: '14px'
    },
    infoMessageContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    mavenInfoIcon: {
      color: aliasTokens.tertiary_text_color,
      width: '16px',
      height: '16px'
    }
  })

export default styles
