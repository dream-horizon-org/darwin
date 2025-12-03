import {Drawer} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Input} from '../../../bit-components/input/index'
import {setUniqueProject} from '../../../modules/workspace/pages/actions'
import {
  CheckUniqueProjectInput,
  SelectionOnData as CheckUniqueProjectSelectionOnData
} from '../../../modules/workspace/pages/graphqlApis/checkUniqueProject/checkUniqueProject'
import {checkUniqueProject} from '../../../modules/workspace/pages/graphqlApis/checkUniqueProject/checkUniqueProject.thunk'
import {IWorkspaceState} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import AttachClusterDropdown from '../attachClusterDropdown/attachClusterDropdown'
import styles from './createProjectDrawerJSS'

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  setOpen: (ev: React.KeyboardEvent | React.MouseEvent) => void
  onCreateProject: (
    projectName: string,
    codespaceName: string,
    clusterId: string
  ) => void
  uniqueProjectData: {
    status: API_STATUS
    data: CheckUniqueProjectSelectionOnData
    error: any
  }
  checkUniqueProjectFunc: (payload: CheckUniqueProjectInput) => void
  resetUniqueProject: () => void
}

const projectNameRegex = /^[A-Za-z][A-Za-z0-9-_ ]*$/
const codespaceNameRegex = /^[A-Za-z][A-Za-z0-9-_ ]*$/

const CreateProjectDrawer = (props: IProps) => {
  const {
    setOpen,
    open,
    classes,
    onCreateProject,
    uniqueProjectData,
    checkUniqueProjectFunc,
    resetUniqueProject
  } = props
  const [projectName, setProjectName] = useState('')
  const [codespaceName, setCodespaceName] = useState('')
  const [cluster, setCluster] = useState(null)

  useEffect(() => {
    return () => {
      resetUniqueProject()
    }
  }, [])

  const setProjectNameFunc = (nameToSet) => {
    setProjectName(nameToSet)
    debouncedCheckUnique({
      projectName: nameToSet
    })
  }

  const debouncedCheckUnique = useCallback(
    debounce(checkUniqueProjectFunc, 500),
    []
  )
  const isNotValidProjectName = Boolean(
    projectName && !projectNameRegex.test(projectName)
  )
  const isNotValidCodespaceName = Boolean(
    codespaceName && !codespaceNameRegex.test(codespaceName)
  )

  return (
    <Drawer
      anchor={'right'}
      open={open}
      onClose={setOpen}
      className={classes.drawerWrapper}
      style={{borderRadius: '0px'}}
      sx={{borderRadius: '0px'}}
    >
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.headerIcon}>
            <IconButton
              onClick={setOpen}
              leadingIcon={Icons.ICON_CLOSE}
              actionableVariants={
                ActionableIconButtonVariants.ACTIONABLE_SECONDARY
              }
              size={IconButtonSizes.LARGE}
              actionable={true}
              disabled={false}
            />
          </div>
          <div className={classes.headerContent}>Create New Project</div>
        </div>
        <div className={classes.content}>
          <div className={classes.fieldWrapper}>
            <Input
              onClick={() => {}}
              name='Input'
              value={projectName}
              label='Project Name'
              onChange={(e) => setProjectNameFunc(e.target.value)}
              error={
                ((uniqueProjectData.status === API_STATUS.SUCCESS ||
                  uniqueProjectData.status === API_STATUS.ERROR) &&
                  !uniqueProjectData?.data?.is_unique) ||
                isNotValidProjectName
              }
              assistiveText={
                isNotValidProjectName
                  ? 'Project name is invalid!'
                  : (uniqueProjectData.status === API_STATUS.SUCCESS ||
                      uniqueProjectData.status === API_STATUS.ERROR) &&
                    !uniqueProjectData?.data?.is_unique &&
                    'This project name already exists'
              }
            />
          </div>
          <div className={classes.fieldWrapper}>
            <Input
              onClick={() => {}}
              name='Input'
              value={codespaceName}
              label='Codespace Name'
              onChange={(e) => setCodespaceName(e.target.value)}
              icon={Icons.ICON_INFO_2}
              error={isNotValidCodespaceName}
              assistiveText={
                isNotValidCodespaceName ? 'Codespace name is invalid!' : ''
              }
            />
          </div>
          <div className={classes.fieldWrapper}>
            <AttachClusterDropdown
              setSelectedCluster={(data) => {
                setCluster(data)
              }}
            />
          </div>
        </div>
        <div className={classes.footer}>
          <Button
            buttonText={'create'}
            onClick={() => {
              if (
                projectName &&
                codespaceName &&
                !isNotValidProjectName &&
                !isNotValidCodespaceName
              ) {
                onCreateProject(projectName, codespaceName, cluster?.id ?? null)
              }
            }}
            variant={ButtonVariants.PRIMARY}
            disabled={
              !projectName ||
              !codespaceName ||
              !uniqueProjectData?.data?.is_unique ||
              isNotValidProjectName ||
              isNotValidCodespaceName
            }
          />
        </div>
      </div>
    </Drawer>
  )
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  uniqueProjectData: state.workspaceProjectReducer.uniqueProject
})

const mapDispatchToProps = (dispatch) => {
  return {
    checkUniqueProjectFunc: (payload: CheckUniqueProjectInput) =>
      checkUniqueProject(dispatch, payload),
    resetUniqueProject: () =>
      dispatch(
        setUniqueProject({
          status: API_STATUS.INIT,
          data: null,
          error: null
        })
      )
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(CreateProjectDrawer)

export default styleComponent
