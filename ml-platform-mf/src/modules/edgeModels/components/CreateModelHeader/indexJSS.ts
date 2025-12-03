import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    root: {
      borderColor: 'red',
      '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
          borderColor: aliasTokens.cta_disabled_tertiary_icon_color
        },
        '&.Mui-focused fieldset': {
          borderColor: aliasTokens.blue_border_color
        }
      }
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'flex-start',
      padding: '20px 24px',
      background: aliasTokens.secondary_background_color,
      margin: '-16px',
      position: 'sticky',
      zIndex: 2,
      marginBottom: '24px'
    },
    left: {
      fontWeight: 700,
      fontSize: '24px',
      display: 'flex'
    },
    leftBackIcon: {
      color: '#D9D9D9',
      marginTop: 4,
      cursor: 'pointer'
    },
    right: {
      display: 'flex'
    },
    chipClearBtn: {
      width: '16px',
      height: '16px',
      marginLeft: '4px'
    },
    leftContainer: {
      maxWidth: 500,
      marginLeft: 16,
      '& .MuiOutlinedInput-input': {
        boxSizing: 'border-box',
        height: '32px',
        borderWidth: '1px',
        padding: '4px 12px'
      }
    },
    searchAndLoaderContainer: {
      display: 'flex'
    },
    tagsRow: {
      padding: '12px 0px 8px 0px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      '& .MuiButton-root': {
        boxSizing: 'border-box',
        height: '32px'
      }
    },
    tagsRowDropdownEnabled: {
      padding: '12px 0px 8px 0px',
      width: 400,
      '& .MuiFormHelperText-root': {
        display: 'none'
      },
      '& .MuiOutlinedInput-root': {
        minHeight: '32px',
        '& .MuiOutlinedInput-input': {
          padding: '0px 12px',
          height: '28px'
        }
      }
    },
    tagsRowChip: {
      '& .MuiChip-root': {
        backgroundColor: aliasTokens.surface_background_color,
        height: 32,
        display: 'flex',
        alignItems: 'center'
      }
    },
    addTagBtn: {
      cursor: 'pointer',
      color: aliasTokens.tertiary_text_color,
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      marginLeft: '20px'
    },
    editButton: {
      height: 28,
      width: 77,
      textTransform: 'none',
      color: '#57ABFF',
      borderColor: '#57ABFF'
    },
    editButtonContainer: {
      display: 'flex',
      alignSelf: 'baseline'
    }
  })

export default styles
