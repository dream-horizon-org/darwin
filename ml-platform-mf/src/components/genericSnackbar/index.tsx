import withStyles, {WithStyles} from '@mui/styles/withStyles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Icons} from '../../bit-components/icon/index'
import {
  Severity,
  VerticalAlignment
} from '../../bit-components/snackbar/constants'
import {Snackbar} from '../../bit-components/snackbar/index'
import {Tooltip, ToolTipPlacement} from '../../bit-components/tooltip/index'
import {setGenericSnackBar} from '../../modules/workspace/pages/actions'
import {
  IGenericSnackBarConfig,
  SnackbarType
} from '../../modules/workspace/pages/reducer'
import styles from './indexJss'

interface IProps extends WithStyles<typeof styles> {
  genericSnackBarConfigData: IGenericSnackBarConfig
  setGenericSnackBarFun: (data: IGenericSnackBarConfig) => void
}

const GenericSnackbar = (props: IProps): JSX.Element => {
  const {genericSnackBarConfigData, setGenericSnackBarFun} = props
  let timeoutStamp = null

  const closeSnackbar = () => {
    setGenericSnackBarFun({
      open: false,
      message: '',
      type: null
    })
  }

  useEffect(() => {
    if (genericSnackBarConfigData.open) {
      timeoutStamp = setTimeout(() => closeSnackbar(), 5000)
    }
    return () => {
      clearTimeout(timeoutStamp)
    }
  }, [genericSnackBarConfigData.open])

  const severity = (() => {
    switch (genericSnackBarConfigData.type) {
      case SnackbarType.SUCCESS:
        return Severity.Success
      case SnackbarType.ERROR:
        return Severity.Failure

      default:
        return Severity.Failure
    }
  })()
  const leadingIcon = (() => {
    switch (genericSnackBarConfigData.type) {
      case SnackbarType.SUCCESS:
        return Icons.ICON_CHECK
      case SnackbarType.ERROR:
        return Icons.ICON_ERROR_OUTLINE

      default:
        return Icons.ICON_ERROR_OUTLINE
    }
  })()

  return (
    <Snackbar
      message={genericSnackBarConfigData.message}
      severity={severity}
      onClose={() => {
        clearTimeout(timeoutStamp)
        closeSnackbar()
      }}
      open={genericSnackBarConfigData.open}
      leadingIcon={leadingIcon}
      vertical={VerticalAlignment.Top}
    />
  )
}

const mapStateToProps = (state) => ({
  genericSnackBarConfigData:
    state['workspaceProjectReducer']['genericSnackBarConfig']
})

const mapDispatchToProps = (dispatch) => {
  return {
    setGenericSnackBarFun: (payload: IGenericSnackBarConfig) =>
      dispatch(setGenericSnackBar(payload))
  }
}

const styleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(GenericSnackbar)

export default styleComponent
