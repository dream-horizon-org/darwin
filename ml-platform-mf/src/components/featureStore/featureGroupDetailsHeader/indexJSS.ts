import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      background: aliasTokens.primary_background_color
    },
    row1: {
      display: 'flex'
    },
    col1: {
      paddingRight: '16px',
      '& .icon-arrow_back:before': {
        color: `${aliasTokens.primary_text_color} !important`
      }
    },
    col2: {
      paddingTop: '10px'
    },
    titleContainer: {
      display: 'flex'
    },
    title: {
      fontWeight: 600,
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      maxWidth: '320px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    type: {
      display: 'flex',
      marginLeft: '12px',
      '&>div': {
        padding: '4px 12px',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        color: aliasTokens.primary_text_color,
        cursor: 'pointer',
        textTransform: 'capitalize'
      }
    },
    typeSingleSelected: {
      border: `1px solid ${aliasTokens.blue_border_color}`,
      backgroundColor: aliasTokens.cta_hover_secondary_background_color,
      borderRadius: '4px'
    },
    typeLeft: {
      border: `1px solid ${aliasTokens.default_border_color}`,
      borderRadius: '4px 0px 0px 4px',
      borderRight: 'none',
      '&.selected': {
        backgroundColor: aliasTokens.cta_hover_secondary_background_color,
        border: `1px solid ${aliasTokens.blue_border_color}`,
        borderRight: `1px solid ${aliasTokens.blue_border_color}`
      }
    },
    rightLeft: {
      border: `1px solid ${aliasTokens.default_border_color}`,
      borderRadius: '0px 4px 4px 0px',
      borderLeft: 'none',
      '&.selected': {
        backgroundColor: aliasTokens.cta_hover_secondary_background_color,
        borderLeft: `1px solid ${aliasTokens.blue_border_color}`,
        border: `1px solid ${aliasTokens.blue_border_color}`
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
      marginLeft: '12px'
    },
    singleVersion: {
      background: aliasTokens.surface_background_color,
      border: `1px solid ${aliasTokens.surface_background_color}`,
      borderRadius: '4px',
      fontWeight: 600,
      fontSize: '12px',
      lineHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.neutral_text_color,
      padding: '2px 4px',
      letterSpacing: '1.5'
    },
    avatarCopyCodeCotainer: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center'
    },
    avatar: {
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      height: '40px',
      width: '40px',
      backgroundColor: aliasTokens.secondary_background_color,
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    col4: {},
    descriptionContainer: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      maxWidth: '800px',
      marginTop: '8px',
      '& span': {
        cursor: 'pointer',
        marginLeft: '4px',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        color: aliasTokens.neutral_text_color
      }
    },
    tagsContainer: {
      marginTop: '12px',
      maxWidth: '800px'
    },
    tagsShowMore: {
      cursor: 'pointer',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      alignItems: 'center',
      color: aliasTokens.cta_secondary_text_color,
      marginLeft: '4px'
    },
    col3: {
      marginLeft: 'auto',
      display: 'flex',
      flexDirection: 'column'
    },
    updatedAt: {
      background: '#33333366',
      borderRadius: '40px',
      padding: '4px 12px 4px 4px',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: '#8F8F8F',
      display: 'flex',
      alignItems: 'center',
      marginTop: '16px'
    },
    time: {
      background: '#404040',
      borderRadius: '20px',
      display: 'inline-block',
      marginRight: '8px',
      '&:before': {
        color: `${aliasTokens.cta_disabled_primary_background_color} !important`
      }
    },
    row2: {}
  })

export default styles
