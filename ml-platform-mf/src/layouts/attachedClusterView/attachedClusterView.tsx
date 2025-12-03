import CloseIcon from '@material-ui/icons/Close'
import {Divider} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../bit-components/button/index'
import SpinnerBackdrop from '../../components/spinnerBackdrop/spinnerBackdrop'
import AttachClusterDropdown, {
  IClusterList
} from '../../components/workspace/attachClusterDropdown/attachClusterDropdown'
import {
  setAttachCluster,
  setSelectedCodespace,
  setSideBarConfig
} from '../../modules/workspace/pages/actions'
import {attachCluster} from '../../modules/workspace/pages/graphqlApis/attachCluster/attachCluster.thunk'
import {ISideBarConfig} from '../../modules/workspace/pages/reducer'
import {
  RightMenuItems,
  SideBarWidth
} from '../../modules/workspace/pages/rightDrawer/constants'
import {API_STATUS} from '../../utils/apiUtils'
import styles from './attachedClusterViewJSS'

interface IProps extends WithStyles<typeof styles> {
  lastSelectedCodespace: any
  attachClusterFunc: (input: any) => void
  resetAttachClusterFunc: (input: any) => void
  detachClusterData: any
  selectedProjectData: any
  attachClusterData: any
  setSelectedCodespaceFunc: (input: any) => void
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
  selectedCodespace: any
}

const AttachedClusterView = (props: IProps) => {
  const {
    classes,
    lastSelectedCodespace,
    attachClusterFunc,
    resetAttachClusterFunc,
    selectedProjectData,
    attachClusterData,
    setSelectedCodespaceFunc,
    setSideBarConfigFunc,
    selectedCodespace
  } = props
  const [selectedCluster, setSelectedCluster] = useState<IClusterList>(null)

  const attachClusterToCodespace = () => {
    if (selectedCodespace.data && selectedCluster) {
      attachClusterFunc({
        codespaceId: selectedCodespace.data.codespace_id,
        clusterId: selectedCluster.id,
        projectId: selectedCodespace.data.project_id
      })
    }
  }

  useEffect(() => {
    if (attachClusterData.status === API_STATUS.SUCCESS) {
      // setSelectedMenu(RightMenuItems.COMPUTE)

      resetAttachClusterFunc({
        status: API_STATUS.INIT,
        data: null,
        error: null
      })
      setSelectedCodespaceFunc({
        ...attachClusterData
      })
    }
  }, [attachClusterData])

  return (
    <>
      <div className={classes.container}>
        <div className={classes.header}>
          <CloseIcon
            onClick={() =>
              setSideBarConfigFunc({
                isOpen: false,
                selectedMenu: null,
                width: SideBarWidth.SmallWidth
              })
            }
            className={classes.closeIcon}
          />
          <div className={classes.title}>Attach a Cluster</div>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.details}>
          <AttachClusterDropdown
            label='Select'
            setSelectedCluster={(data) => {
              setSelectedCluster(data)
            }}
          />
        </div>
        <div className={classes.footer}>
          <Button
            buttonText={'attach'}
            onClick={() => {
              if (
                selectedCluster &&
                attachClusterData.status !== API_STATUS.LOADING
              ) {
                // call attach cluster api
                attachClusterToCodespace()
              }
            }}
            variant={ButtonVariants.PRIMARY}
            disabled={
              !selectedCluster ||
              !selectedCodespace.data ||
              !selectedCodespace.data.project_id ||
              attachClusterData.status === API_STATUS.LOADING
            }
          />
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state) => ({
  lastSelectedCodespace:
    state['workspaceProjectReducer']['lastSelectedCodespace'],
  attachClusterData: state['workspaceProjectReducer']['attachCluster'],
  selectedProjectData: state['workspaceProjectReducer']['selectedProject'],
  selectedCodespace: state['workspaceProjectReducer']['selectedCodespace']
})

const mapDispatchToProps = (dispatch) => {
  return {
    attachClusterFunc: (payload) => attachCluster(payload, dispatch),
    resetAttachClusterFunc: (payload) => dispatch(setAttachCluster(payload)),
    setSelectedCodespaceFunc: (payload) =>
      dispatch(setSelectedCodespace(payload)),
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload))
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(AttachedClusterView)

export default styleComponent
