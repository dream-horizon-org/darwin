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
      },
      '& .MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeMedium': {
        height: 48
      }
    }
  })

export default styles
