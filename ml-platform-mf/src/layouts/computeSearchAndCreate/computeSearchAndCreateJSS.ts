import {createStyles} from '@mui/material'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    search: {
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    createBtn: {
      display: 'flex',
      flex: '0 0 292px',
      marginLeft: '24px',

      '& > button': {
        width: '100%'
      }
    },
    filterByText: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: '#4D4D4D',
      textWrap: 'nowrap'
    },
    filterByMeChip: {},
    filtersContainer: {
      width: 'fit-content',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      columnGap: '8px',
      marginLeft: '24px'
    },
    activeInactiveFilterContainer: {
      '& button': {
        whiteSpace: 'nowrap'
      }
    }
  })

export default styles
