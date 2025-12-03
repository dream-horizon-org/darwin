import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      height: 'fit-content',
      padding: '12px',
      boxSizing: 'border-box',
      border: '1px solid #333333',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      background: 'transparent',
      borderRadius: '8px'
    },
    secondaryContainer: {
      background: '#121212',
      border: 'none'
    },

    selected: {
      background: '#022445',
      border: '1px solid #0074E8'
    },
    name: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
      margin: '0',
      width: '140px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      flex: 1
    },
    attachedIndicator: {
      width: 'fit-content',
      height: 'fit-content',
      padding: '3px 4px',
      boxSizing: 'border-box',
      backgroundColor: '#40266E',
      color: '#D9D9D9',
      fontSize: '10px',
      fontWeight: '400',
      borderRadius: '4px'
    },

    actionsContainer: {
      width: 'fit-content',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      columnGap: '12px',
      marginLeft: 'auto'
    },
    clusterDetailsContainer: {
      width: '100%',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      columnGap: '8px',

      '& p': {
        fontSize: '12px',
        fontWeight: '400',
        lineHeight: '16px',
        color: '#8F8F8F',
        margin: '0'
      }
    },

    actionIcon: {
      fontSize: '16px',
      color: '#DADADA',

      '&:hover': {
        color: 'rgba(87, 171, 255, 1)'
      }
    },

    actionButton: {
      padding: '0'
    },
    divider: {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      background: '#4D4D4D'
    },
    dialogContentWrapper: {
      width: '500px',
      minHeight: '60px'
    }
  })

export default styles
