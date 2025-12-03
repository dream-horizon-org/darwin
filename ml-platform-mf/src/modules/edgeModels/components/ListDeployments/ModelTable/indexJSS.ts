import {Height} from '@mui/icons-material'
import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    dataList: {
      marginTop: '16px',

      '& .MuiTableRow-root': {
        cursor: 'pointer'
      },
      '& .primary': {
        height: 'inherit'
      },
      '& [data-testid="surface-element"]': {
        height: 'inherit'
      }
    },
    marginTags: {
      display: 'flex',
      '& > div': {
        marginLeft: '8px',
        '&:first-of-type': {
          marginLeft: 0
        }
      }
    },
    showMore: {
      marginLeft: '8px',
      fontSize: '12px',
      fontWeight: 400,
      color: '#57ABFF',
      cursor: 'pointer'
    }
  })

export default styles
