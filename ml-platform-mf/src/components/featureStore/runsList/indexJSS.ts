import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      flex: 1,
      margin: '-24px -24px -24px -32px',
      display: 'flex'
    },
    placeholder: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: aliasTokens.neutral_text_color,
      fontSize: '18px',
      fontWeight: 600
    },
    runsListContainer: {
      flex: '0 0 238px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${aliasTokens.disabled_border_color}`
    },
    tableContainer: {
      flex: 1,
      background: '#000000',
      maxWidth: 'calc(100% - 238px)',
      padding: '20px 0px 0px 24px',
      display: 'flex',
      flexDirection: 'column'
    },
    runContainer: {
      display: 'flex',
      padding: '24px 16px',
      cursor: 'pointer',
      background: aliasTokens.primary_background_color,
      borderLeft: `10px solid ${aliasTokens.primary_background_color}`,
      '&.selected': {
        background: '#000000',
        borderRight: 'none',
        marginRight: '-1px',
        borderLeft: `10px solid ${aliasTokens.blue_border_color_2}`
      }
    },
    runsStatus: {},
    runData: {},
    runTitle: {
      fontWeight: 600,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color
    },
    runDuration: {
      marginTop: '4px',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.tertiary_text_color
    },

    success: {
      '&:before': {
        color: '#11A73B !important'
      },
      marginRight: '10px',
      fontSize: '20px'
    },
    failure: {
      '&:before': {
        color: '#E10000 !important'
      },
      marginRight: '10px',
      fontSize: '20px'
    },
    tableWrapper: {
      display: 'flex',
      overflow: 'auto',
      maxHeight: 'calc(100% - 98px)'
    },
    tableColumns: {
      display: 'grid',
      gridTemplateColumns: 'minmax(200px, 1fr)',
      flex: 1,
      '&:first-child>div:first-child': {
        'border-top-left-radius': '8px'
      }
    },
    fTitle: {
      background: aliasTokens.cta_disabled_primary_text_color,
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      padding: '14px 16px',
      textTransform: 'capitalize',
      border: `0.5px solid #33333399`,
      position: 'sticky',
      top: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    fMeanBody: {
      color: aliasTokens.neutral_text_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      '& div': {
        display: 'flex',
        justifyContent: 'space-between',
        '& span': {
          textTransform: 'capitalize',
          '&:first-child': {
            marginRight: '12px'
          }
        }
      },
      border: `0.5px solid #33333399`
    },
    fData: {
      color: aliasTokens.neutral_text_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      padding: '14px 16px',
      border: `0.5px solid #33333399`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    fFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderBottomLeftRadius: '8px',
      background: aliasTokens.cta_disabled_primary_text_color,
      '& span': {
        color: aliasTokens.neutral_text_color,
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400
      },
      '& span:first-child': {
        color: aliasTokens.tertiary_text_color
      }
    },
    otherfactorWrapper: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '& span:nth-child(2)': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    },
    tableError: {
      margin: 'auto'
    },
    tableErrorIcon: {
      display: 'flex',
      justifyContent: 'center'
    },
    tableErrorText: {
      color: aliasTokens.neutral_text_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px'
    }
  })

export default styles
