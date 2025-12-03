import {createStyles} from '@mui/material'

const styles = () =>
  createStyles({
    container: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      top: '48px',
      left: '48px',
      width: 'calc(100% - 48px)',
      height: 'calc(100% - 48px)',
      '& >iframe': {
        border: 'none',
        flex: 1
      }
    }
  })

export default styles
