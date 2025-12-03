import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: '48px',
      background: aliasTokens.primary_background_color,
      zIndex: 1,
      paddingBottom: '24px'
    },
    row1: {
      display: 'flex',
      marginTop: '16px'
    },
    searchContainer: {
      display: 'flex',
      flex: '1 1 424px',
      maxWidth: '424px',
      justifyContent: 'space-between'
    },
    filterContainer: {
      display: 'flex',
      marginLeft: 'auto',
      alignItems: 'center'
    },
    filterTitle: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      textAlign: 'center',
      color: '#8F8F8F',
      marginRight: '4px'
    },
    row2: {
      marginTop: '20px',
      '& .MuiTabs-flexContainer': {
        backgroundColor: aliasTokens.primary_background_color
      },
      '& .MuiTabs-indicator': {
        borderBottom: `2px solid ${aliasTokens.base_text_color}`
      },
      '& .Mui-selected': {
        color: `${aliasTokens.base_text_color} !important`
      },
      '& .MuiTab-root': {
        color: aliasTokens.neutral_text_color,
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '20px',
        textTransform: 'none'
      }
    },
    tabIcon: {
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      padding: '2px 8px',
      fontWeight: 600,
      fontSize: '12px',
      lineHeight: '16px',
      color: aliasTokens.neutral_text_color,
      borderRadius: '4px'
    },
    filterByText: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      textAlign: 'center',
      color: aliasTokens.primary_text_color,
      marginLeft: '12px'
    },
    sortingDrop: {
      alignSelf: 'end',
      minWidth: '84px'
    },
    dropdownStyle: {
      background: aliasTokens.tertiary_background_color,
      border: 'none',
      borderRadius: '4px',
      '& .MuiList-root': {
        padding: '2px 0px'
      },
      '& .MuiMenuItem-root': {
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        margin: '2px 4px',
        borderRadius: '4px',
        padding: '10px 8px',

        '&:hover': {
          background: '#4D4D4D'
        },
        '&.active': {
          background: '#4D4D4D'
        }
      }
    }
  })

export default styles
