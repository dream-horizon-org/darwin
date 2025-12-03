import {Color} from '@material-ui/lab'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import {Button, IconButton, Portal, Snackbar} from '@mui/material'
import MuiAlert, {AlertProps} from '@mui/material/Alert'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {compose} from 'redux'

import styles from './snackBarJSS'

interface IProps extends WithStyles<typeof styles> {
  snackbar: {
    open: boolean
    message: string
    action: string
    fileUrl: string
    severity: Color
  }
  closeSnackBar: () => void
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const SnackBarPortal = (props: IProps) => {
  const {snackbar, closeSnackBar, classes} = props
  return (
    <Portal>
      <Snackbar
        data-test='snackbar'
        open={snackbar.open}
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        autoHideDuration={6000}
        onClose={!snackbar.fileUrl ? closeSnackBar : () => {}}
      >
        <Alert
          severity={snackbar.severity}
          onClose={closeSnackBar}
          iconMapping={{
            success: <CheckCircleOutlineIcon fontSize='inherit' />
          }}
          className={classes[props.snackbar.severity]}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Portal>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  SnackBarPortal
)

export default styleComponent
