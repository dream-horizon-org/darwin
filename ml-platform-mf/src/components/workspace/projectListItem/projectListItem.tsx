import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined'
import {IconButton} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import {format} from 'date-fns'
import React, {useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dialog} from '../../../bit-components/dialog/index'
import {setSelectedProject} from '../../../modules/workspace/pages/actions'
import {SelectionOnData as GetProjectsSelectionOnData} from '../../../modules/workspace/pages/graphqlApis/getProjects/getProjects'
import {IWorkspaceState} from '../../../modules/workspace/pages/reducer'
import {
  getIntialsFromEmail,
  getProjectName,
  getTimeDiff
} from '../../../modules/workspace/utils'

import styles from './projectListItemJSS'

interface IProps extends WithStyles<typeof styles> {
  project: GetProjectsSelectionOnData
  onDeleteProject: (projectId: string) => void
  setSelectedProject: (payload: any) => any
  selectedProject: any
  onEditProjectClicked: (projectId: string, projectName: string) => void
}

const ProjectListItem = (props: IProps) => {
  const {
    classes,
    project,
    onDeleteProject,
    setSelectedProject,
    selectedProject,
    onEditProjectClicked
  } = props
  const [activateDialogOpen, setActivateDialogOpen] = useState({
    open: false
  })

  const openDialog = (e) => {
    e.stopPropagation()
    setActivateDialogOpen({
      open: true
    })
  }

  const onProjectClicked = (e) => {
    setSelectedProject({
      projectId: project.project_id
    })
  }

  return (
    <div
      className={`${classes.container} ${
        selectedProject?.projectId === project.project_id ? classes.active : ''
      }`}
      onClick={onProjectClicked}
    >
      <Dialog
        handleClose={(e) => {
          e.stopPropagation()
          setActivateDialogOpen({
            open: false
          })
        }}
        testIdentifier='deleteCodespace'
        title={'Delete Project'}
        open={activateDialogOpen.open}
        dialogContent={
          <div>
            {
              'Deleting the project will delete all its Codespaces as well. Are you sure you want to delete ?'
            }
          </div>
        }
        dialogFooter={{
          primaryButton: {
            text: 'Delete',
            onClick: (e) => {
              e.stopPropagation()
              onDeleteProject(project.project_id)
              setActivateDialogOpen({
                open: false
              })
            },
            testIdentifier: 'primaryButton'
          },
          secondaryButton: {
            text: 'Cancel',
            onClick: (e) => {
              e.stopPropagation()
              setActivateDialogOpen({
                open: false
              })
            },
            testIdentifier: 'secondaryButton'
          }
        }}
      />
      <div className={classes.left}>
        <div className={classes.userIcon}>
          {getIntialsFromEmail(project.created_by)}
        </div>
        <div className={classes.projectDetails}>
          <div className={classes.projectName}>
            {getProjectName(project.project_name)}
          </div>
          <div className={classes.subText}>
            Created on {format(new Date(project.created_on), 'do MMM yy')},{' '}
            {project.number_of_codespaces}{' '}
            {`Codespace${project.number_of_codespaces > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
      <div className={classes.right}>
        <div className={classes.smallSubText}>
          Updated: {getTimeDiff(project.last_updated)}
        </div>
        <div>
          <IconButton
            className={classes.iconButton}
            onClick={(e) => {
              e.stopPropagation()
              onEditProjectClicked(project.project_id, project.project_name)
            }}
          >
            <ModeEditOutlineOutlinedIcon className={classes.rightIcon} />
          </IconButton>
          <IconButton className={classes.iconButton} onClick={openDialog}>
            <DeleteOutlineOutlinedIcon className={classes.rightIcon} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedProject: (payload) => dispatch(setSelectedProject(payload))
  }
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  selectedProject: state.workspaceProjectReducer.selectedProject
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ProjectListItem)

export default styleComponent
