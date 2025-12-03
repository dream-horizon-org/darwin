import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      minHeight: '232px',
      background: aliasTokens.secondary_background_color,
      borderRadius: '8px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid transparent`,
      '&:hover': {
        boxShadow:
          '0 1px 3px 0 rgb(60 64 67 / 30%), 0 4px 8px 3px rgb(60 64 67 / 15%)',
        transform: 'scale(1.005, 1.005)',
        cursor: 'pointer'
      }
    },
    row1: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    title: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      lineClamp: 2,
      boxOrient: 'vertical',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    versions: {
      '& .MuiOutlinedInput-input': {
        padding: '4px',
        paddingRight: '22px !important',
        textAlign: 'center'
      },
      '& .MuiSelect-icon': {
        right: '2px'
      },
      '& .MuiOutlinedInput-root:hover fieldset': {
        borderColor: aliasTokens.default_border_color
      },
      marginLeft: '8px'
    },
    singleVersion: {
      background: aliasTokens.surface_background_color,
      border: `1px solid ${aliasTokens.surface_background_color}`,
      borderRadius: '4px',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.neutral_text_color,
      padding: '4px 8px',
      marginLeft: '8px'
    },
    description: {
      marginTop: '8px',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      lineClamp: 2,
      boxOrient: 'vertical',
      flex: 1
    },
    row3: {
      margin: '22px 0',
      display: 'flex',
      color: aliasTokens.tertiary_text_color,
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '20px'
    },
    featuresCount: {
      marginRight: '22px',
      display: 'flex',
      alignItems: 'center'
    },
    usage: {
      display: 'flex',
      borderLeft: `1px solid ${aliasTokens.tertiary_background_color}`,
      marginLeft: '4px'
    },
    usageMetrix: {
      display: 'flex',
      padding: '0px 18px',
      alignItems: 'center'
    },
    usageText: {
      marginLeft: '8px'
    },
    row4: {
      display: 'flex',
      marginTop: 'auto',
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      alignItems: 'center',
      background: '#33333366',
      borderRadius: '40px',
      width: 'fit-content',
      height: '32px',
      padding: '6px 12px 6px 6px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    time: {
      marginRight: '8px'
    },
    popoverContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '352px',
      padding: '12px'
    },
    popoverActions: {
      display: 'flex',
      alignItems: 'center'
    },
    runs: {
      display: 'flex',
      flexDirection: 'column'
    },
    tags: {
      display: 'flex',
      flexDirection: 'column'
    },
    popoverTitle: {
      fontWeight: 700,
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.neutral_text_color,
      marginTop: '20px',
      paddingBottom: '4px'
    },
    closeIcon: {
      marginLeft: 'auto',
      cursor: 'pointer'
    },
    success: {
      '&:before': {
        color: '#11A73B !important'
      },
      marginRight: '13px',
      fontSize: '20px'
    },
    failure: {
      '&:before': {
        color: '#E10000 !important'
      },
      marginRight: '13px',
      fontSize: '20px'
    },
    activeCard: {
      border: `1px solid ${aliasTokens.cta_secondary_text_color}`,
      boxShadow:
        '0 1px 3px 0 rgb(60 64 67 / 30%), 0 4px 8px 3px rgb(60 64 67 / 15%)',
      transform: 'scale(1.005, 1.005)',
      cursor: 'pointer'
    },
    chipContainer: {
      marginTop: '6px',
      marginRight: '4px',
      display: 'inline-block'
    }
  })

export default styles
