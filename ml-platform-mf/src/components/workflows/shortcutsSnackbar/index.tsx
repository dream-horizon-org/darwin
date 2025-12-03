import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {Button} from '@mui/material'
import MuiAlert, {AlertProps} from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

import {WithStyles, withStyles} from '@mui/styles'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  onClose: () => void
  text: string
  btnText: string
  marginBottom: number
  onBtnClicked: () => void
}

const ShortcutsSnackBar = (props: IProps) => {
  const {classes, open, onClose, text, btnText, marginBottom, onBtnClicked} =
    props

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={12000}
        onClose={onClose}
        className={classes.snackbar}
        style={{marginBottom: marginBottom}}
      >
        <div className={classes.container}>
          <div>{text}</div>
          <Button variant='text' size='small' onClick={onBtnClicked}>
            {btnText}
          </Button>
          <CloseIcon className={classes.closeIcon} onClick={onClose} />
        </div>
      </Snackbar>
    </>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ShortcutsSnackBar)

export default StyleComponent
