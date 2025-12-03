import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      borderRadius: '8px',
      overflow: 'hidden',
      // marginBottom: '16px',
      marginTop: '16px'
    },
    title: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      background: aliasTokens.secondary_background_color,
      padding: '18px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    info: {
      background: aliasTokens.neutral_background_color,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px'
    },
    nodeTypeWrapper: {
      width: '380px'
    },
    heading2: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      marginTop: '24px',
      marginBottom: '12px'
    },
    inputList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      marginTop: '24px'
    },
    inputWrapper: {
      display: 'flex',
      margin: '0 8px',
      flex: 1,
      '& >span': {
        marginLeft: '8px',
        lineHeight: '40px',
        fontWeight: '400',
        fontSize: '14px',
        color: aliasTokens.neutral_text_color
      },
      '&:first-child': {
        marginLeft: '0px'
      },
      '&:last-child': {
        marginRight: '0px'
      }
    },
    discSettingBtn: {
      marginTop: '24px'
      // cursor: 'pointer',
      // color: aliasTokens.cta_secondary_text_color,
      // fontWeight: '700',
      // fontSize: '14px',
      // lineHeight: '20px',
      // width: 'fit-content',
    },
    discSettingsWrapperOpen: {
      display: 'flex',
      paddingTop: '7px',
      height: '80px',
      overflow: 'hidden',
      transition: 'height 0.15s',
      width: '49%',
      paddingLeft: '14px'
    },
    discSettingsWrapperClosed: {
      display: 'flex',
      paddingTop: '7px',
      height: '0px',
      overflow: 'hidden',
      transition: 'height 0.15s',
      width: '49%',
      paddingLeft: '14px'
    },
    discSettingDrop: {
      flex: 1,
      paddingTop: '7px'
    },
    discSettingInput: {
      flex: 1,
      paddingTop: '7px',
      marginLeft: '16px',
      display: 'flex',
      '& >span': {
        marginLeft: '8px',
        lineHeight: '40px',
        fontWeight: '400',
        fontSize: '14px',
        color: aliasTokens.neutral_text_color
      }
    },
    errorMsg: {
      color: '#e10000',
      fontSize: '12px'
    },
    radioContainer: {
      display: 'flex',
      gap: '16px'
    }
  })

export default styles
