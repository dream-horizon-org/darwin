import withStyles, {WithStyles} from '@mui/styles/withStyles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {setGlobalSnackBar} from '../../actions/commonActions'
import {Icons} from '../../bit-components/icon/index'
import {
  Severity,
  VerticalAlignment
} from '../../bit-components/snackbar/constants'
import {Snackbar} from '../../bit-components/snackbar/index'
import {SnackbarType} from '../../modules/workspace/pages/reducer'
import {CommonState, IGlobalSnackBarConfig} from '../../reducers/commonReducer'
import styles from './indexJss'

interface IProps extends WithStyles<typeof styles> {
  globalSnackBarConfigData: IGlobalSnackBarConfig
  setGlobalSnackBarFunc: (payload: IGlobalSnackBarConfig) => any
}

const GlobalSnackbar = (props: IProps): JSX.Element => {
  const {globalSnackBarConfigData, setGlobalSnackBarFunc} = props
  let timeoutStamp = null

  const closeSnackbar = () => {
    setGlobalSnackBarFunc({
      open: false,
      message: '',
      type: null
    })
  }

  useEffect(() => {
    if (globalSnackBarConfigData.open) {
      timeoutStamp = setTimeout(() => closeSnackbar(), 5000)
    }
    return () => {
      clearTimeout(timeoutStamp)
    }
  }, [globalSnackBarConfigData.open])

  const severity = (() => {
    switch (globalSnackBarConfigData.type) {
      case SnackbarType.SUCCESS:
        return Severity.Success
      case SnackbarType.ERROR:
        return Severity.Failure

      default:
        return Severity.Failure
    }
  })()
  const leadingIcon = (() => {
    switch (globalSnackBarConfigData.type) {
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
      message={globalSnackBarConfigData.message}
      severity={severity}
      onClose={() => {
        clearTimeout(timeoutStamp)
        closeSnackbar()
      }}
      open={globalSnackBarConfigData.open}
      leadingIcon={leadingIcon}
      vertical={VerticalAlignment.Bottom}
    />
  )
}

const mapStateToProps = (state: CommonState) => ({
  globalSnackBarConfigData: state.commonReducer.globalSnackBar
})

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackBarFunc: (payload: IGlobalSnackBarConfig) =>
      dispatch(setGlobalSnackBar(payload))
  }
}

const styleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(GlobalSnackbar)

export default styleComponent
