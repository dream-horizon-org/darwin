import {Close} from '@mui/icons-material'
import {AppBar, Dialog, DialogContent, Toolbar, Typography} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {compose} from 'redux'
import styles from './customDialogJss'

// FIXME checkout https://mui.com/components/use-media-query/#using-material-uis-breakpoint-helpers
const withMobileDialog = () => (WrappedComponent) => (props) =>
  <WrappedComponent {...props} width='lg' fullScreen={false} />

export interface ICustomDialogProps extends WithStyles<typeof styles> {
  fullScreen?: boolean
  dialogFooter: JSX.Element
  fullWidth?: boolean
  dialogContent: JSX.Element
  fullWidthDialogContent: boolean
  visible?: boolean
  header: string | JSX.Element
  dataKey?: string
  handleClose: () => void
  centerAlign?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  scroll?: 'body' | 'paper'
  headerClass?: string
  customStyleFornullPadding: boolean
  isCustomStyleClass?: boolean
  headerBgColor?: any
  dataTest?: string
}

function CustomDialog(props: ICustomDialogProps) {
  const {fullScreen} = props
  const {
    classes,
    dialogFooter,
    dialogContent,
    centerAlign,
    maxWidth,
    fullWidthDialogContent,
    headerClass,
    isCustomStyleClass,
    headerBgColor,
    dataTest
  } = props
  return (
    <Dialog
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      open={props.visible}
      className={!centerAlign && !fullScreen ? classes.rightDialog : ''}
      classes={{paper: isCustomStyleClass ? classes.paper : ''}}
      aria-labelledby='scroll-dialog-title'
      data-test={dataTest}
    >
      {props.header && (
        <AppBar
          position='static'
          color={headerBgColor || 'primary'}
          id='scroll-dialog-title'
          className={`${headerClass ? classes[headerClass] : ''}`}
        >
          <Toolbar className={classes.dialogHeader}>
            <Typography
              variant='button'
              color='inherit'
              classes={{root: classes.dialogHeaderContent}}
            >
              {props.header}
            </Typography>
            <Close
              data-test={props.dataKey}
              className={classes.closeButton}
              onClick={props.handleClose}
            />
          </Toolbar>
        </AppBar>
      )}
      {fullWidthDialogContent ? (
        <div className={classes.dialogContent}>{dialogContent}</div>
      ) : (
        <DialogContent
          className={`${
            props.customStyleFornullPadding ? classes.noPadding : ''
          }`}
        >
          {dialogContent}
        </DialogContent>
      )}

      {dialogFooter &&
        (fullWidthDialogContent ? (
          <div className={classes.dialogBottomContainer}>{dialogFooter}</div>
        ) : (
          <DialogActions className={classes.dialogBottomContainer}>
            {dialogFooter}
          </DialogActions>
        ))}
    </Dialog>
  )
}
CustomDialog.defaultProps = {
  centerAlign: false,
  maxWidth: false,
  fullWidthDialogContent: false
}
export default compose(
  withStyles(styles, {withTheme: true}),
  withMobileDialog()
)(CustomDialog)
