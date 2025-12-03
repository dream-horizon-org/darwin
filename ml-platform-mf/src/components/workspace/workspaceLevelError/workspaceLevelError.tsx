import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {setSideBarConfig} from '../../../modules/workspace/pages/actions'
import {ISideBarConfig} from '../../../modules/workspace/pages/reducer'
import {
  RightMenuItems,
  SideBarWidth
} from '../../../modules/workspace/pages/rightDrawer/constants'
import {errorTypes} from './constants'
import styles from './workspaceLevelErrorJSS'

interface IProps extends WithStyles<typeof styles> {
  type: errorTypes
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
}

const WorkspaceLevelError = (props: IProps) => {
  const {classes, type, setSideBarConfigFunc} = props

  const NoIntenetConnection = (
    <div className={classes.mainData}>
      <span className={Icons.ICON_CLOUD_OFF} />
      <div className={classes.header}>No Internet Connection</div>
      <div className={classes.info}>
        Please check your internet connection and try again
      </div>
    </div>
  )
  const clusterAttachmentFailed = (
    <div className={classes.mainData}>
      <span
        className={`${Icons.ICON_REPORT_GMAILERRORRED} ${classes.iconColor}`}
      />
      <div className={classes.header}>
        Project imported successfully but failed to attach a cluster.
      </div>
      <div className={classes.infoButton}>
        <Button
          buttonText={'Attach a cluster'}
          onClick={() =>
            setSideBarConfigFunc({
              isOpen: true,
              selectedMenu: RightMenuItems.COMPUTE,
              width: SideBarWidth.SmallWidth
            })
          }
          variant={ButtonVariants.SECONDARY}
          disabled={false}
        />
      </div>
    </div>
  )

  const clusterDetached = (
    <div className={classes.mainData}>
      <span
        className={`${Icons.ICON_REPORT_GMAILERRORRED} ${classes.iconColor}`}
      />
      <div className={classes.header}>
        Please attach a cluster to work on notebooks.
      </div>
      <div className={classes.infoButton}>
        <Button
          buttonText={'Attach a cluster'}
          onClick={() =>
            setSideBarConfigFunc({
              isOpen: true,
              selectedMenu: RightMenuItems.COMPUTE,
              width: SideBarWidth.SmallWidth
            })
          }
          variant={ButtonVariants.SECONDARY}
          disabled={false}
        />
      </div>
    </div>
  )

  const clusterActivationFailed = (
    <div className={classes.mainData}>
      <span
        className={`${Icons.ICON_REPORT_GMAILERRORRED} ${classes.iconColor}`}
      />
      <div className={classes.header}>
        Cluster activation time exceeded, please reach out to team Darwin!
      </div>
    </div>
  )

  const launchCodespaceFailed = (
    <div className={classes.mainData}>
      <span
        className={`${Icons.ICON_REPORT_GMAILERRORRED} ${classes.iconColor}`}
      />
      <div className={classes.header}>
        Failed to launch codespace, please try refreshing the page once!
      </div>
    </div>
  )

  return (
    <div className={classes.container}>
      {type === errorTypes.NO_INTERNET ? NoIntenetConnection : null}
      {type === errorTypes.NO_CLUSTER ? clusterAttachmentFailed : null}
      {type === errorTypes.CLUSTER_DETACHED ? clusterDetached : null}
      {type === errorTypes.CLUSTER_ACTIVATION_FAILED
        ? clusterActivationFailed
        : null}
      {type === errorTypes.LAUNCH_CODESPACE_FAILED
        ? launchCodespaceFailed
        : null}
    </div>
  )
}

const mapStateToProps = (state) => ({
  // sideBarConfigData: state['workspaceProjectReducer']['sideBarConfig']
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload))
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkspaceLevelError)

export default styleComponent
