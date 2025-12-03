import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect} from 'react'

import {connect} from 'react-redux'
import {compose} from 'redux'
import {setInfoBar} from '../../modules/workspace/pages/actions'
import {
  INFO_BAR_TYPE,
  IWorkspaceState
} from '../../modules/workspace/pages/reducer'
import {CommonState, ICommonState} from '../../reducers/commonReducer'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  infoBarState: IWorkspaceState['infoBar']
  setInfoBar: (infoBar: IWorkspaceState['infoBar']) => void
}

const InfoBar = (props: IProps) => {
  const {classes, infoBarState, setInfoBar} = props

  const getIcon = () => {
    switch (infoBarState.type) {
      case INFO_BAR_TYPE.ERROR:
        return <ErrorOutlineIcon />
      case INFO_BAR_TYPE.WARNING:
        return <WarningAmberIcon />
      case INFO_BAR_TYPE.SUCCESS:
        return <CheckIcon />
      default:
        return <WarningAmberIcon />
    }
  }

  const getClass = () => {
    switch (infoBarState.type) {
      case INFO_BAR_TYPE.ERROR:
        return classes.error
      case INFO_BAR_TYPE.WARNING:
        return classes.warning
      case INFO_BAR_TYPE.SUCCESS:
        return classes.success
      default:
        return classes.warning
    }
  }

  useEffect(() => {
    if (infoBarState.autoHideDuration) {
      setTimeout(() => {
        onClose()
      }, infoBarState.autoHideDuration)
    }
  }, [infoBarState.autoHideDuration])

  const onClose = () => {
    setInfoBar({
      message: '',
      type: null,
      autoHideDuration: null,
      open: false
    })
  }

  return infoBarState.open ? (
    <div className={`${classes.container} ${getClass()}`}>
      <div className={classes.left}>
        {getIcon()}
        <span className={classes.msg}>{infoBarState.message}</span>
      </div>
      <div className={classes.right}>
        <CloseIcon className={classes.pointer} onClick={onClose} />
      </div>
    </div>
  ) : (
    <></>
  )
}

const mapStateToProps = (state: CommonState) => ({
  infoBarState: state.workspaceProjectReducer.infoBar
})

const mapDispatchToProps = (dispatch) => ({
  setInfoBar: (infoBar: IWorkspaceState['infoBar']) =>
    dispatch(setInfoBar(infoBar))
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(InfoBar)

export default styleComponent
