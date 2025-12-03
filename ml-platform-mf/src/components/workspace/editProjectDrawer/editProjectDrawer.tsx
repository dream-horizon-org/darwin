import {CircularProgress, Drawer} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Input} from '../../../bit-components/input/index'
import {
  CheckUniqueProjectInput,
  SelectionOnData as CheckUniqueProjectSelectionOnData
} from '../../../modules/workspace/pages/graphqlApis/checkUniqueProject/checkUniqueProject'

import {connect} from 'react-redux'
import {compose} from 'redux'
import {Icons} from '../../../bit-components/icon/index'
import {setUniqueProject} from '../../../modules/workspace/pages/actions'
import {checkUniqueProject} from '../../../modules/workspace/pages/graphqlApis/checkUniqueProject/checkUniqueProject.thunk'
import {
  IEditProject,
  IWorkspaceState
} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import styles from './editProjectDrawerJSS'

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  setOpen: (ev: React.KeyboardEvent | React.MouseEvent) => void
  oldProjectName: string
  projectId: string
  onEditProject: (projectName: string, projectId: string) => void
  uniqueProjectData: {
    status: API_STATUS
    data: CheckUniqueProjectSelectionOnData
    error: any
  }
  checkUniqueProjectFunc: (payload: CheckUniqueProjectInput) => void
  resetUniqueProject: () => void
  editProjectResponse: IEditProject
}

const projectNameRegex = /^[A-Za-z][A-Za-z0-9-_ ]*$/

const EditProjectDrawer = (props: IProps) => {
  const {
    setOpen,
    open,
    classes,
    oldProjectName,
    projectId,
    onEditProject,
    uniqueProjectData,
    checkUniqueProjectFunc,
    resetUniqueProject,
    editProjectResponse
  } = props
  const [projectName, setProjectName] = useState(oldProjectName)

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
          <div className={classes.headerContent}>
            Edit Project {oldProjectName}
          </div>
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
        </div>
        <div className={classes.footer}>
          {editProjectResponse.status === API_STATUS.LOADING ? (
            <CircularProgress size={30} />
          ) : (
            <Button
              buttonText={'update'}
              onClick={() => {
                if (projectName && !isNotValidProjectName) {
                  onEditProject(projectName, projectId)
                }
              }}
              variant={ButtonVariants.PRIMARY}
              disabled={
                !projectName ||
                !uniqueProjectData?.data?.is_unique ||
                isNotValidProjectName
              }
            />
          )}
        </div>
      </div>
    </Drawer>
  )
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  uniqueProjectData: state.workspaceProjectReducer.uniqueProject,
  editProjectResponse: state.workspaceProjectReducer.editProject
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
)(EditProjectDrawer)

export default styleComponent
