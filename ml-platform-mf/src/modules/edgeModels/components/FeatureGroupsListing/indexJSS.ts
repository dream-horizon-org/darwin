import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100vw'
    },
    leftSearchFilter: {
      width: '324px',
      marginTop: '24px',
      marginBottom: '24px'
    },
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
      },
      '& .MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeMedium': {
        height: 48
      }
    },
    closeDiv: {
      display: 'flex',
      color: '#D9D9D9'
    }
  })

export default styles
