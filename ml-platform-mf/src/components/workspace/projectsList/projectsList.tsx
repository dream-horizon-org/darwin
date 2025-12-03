import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined'
import {IconButton} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import React from 'react'
import {IProjectList} from '../../../modules/workspace/pages/reducer'

import {API_STATUS} from '../../../utils/apiUtils'
import Spinner from '../../spinner/spinner'
import ProjectListItem from '../projectListItem/projectListItem'
import styles from './projectsListJSS'

interface IProps extends WithStyles<typeof styles> {
  projects: IProjectList
  onImportProjectClicked: (
    event: React.KeyboardEvent | React.MouseEvent
  ) => void
  onCreateProjectClicked: (e: React.KeyboardEvent | React.MouseEvent) => void
  onDeleteProject: (projectId: string) => void
  onEditProjectClicked: (projectId: string, projectName: string) => void
}

const ProjectsList = (props: IProps) => {
  const {
    classes,
    projects,
    onImportProjectClicked,
    onCreateProjectClicked,
    onDeleteProject,
    onEditProjectClicked
  } = props

  return (
    <div className={classes.projectsList}>
      <div className={classes.header}>
        <div className={classes.headerName}>Projects</div>
        <div>
          <IconButton>
            <CloudDownloadOutlinedIcon
              fontSize='small'
              className={classes.icon}
              onClick={onImportProjectClicked}
            />
          </IconButton>
          <IconButton>
            <AddOutlinedIcon
              fontSize='small'
              className={classes.icon}
              onClick={onCreateProjectClicked}
            />
          </IconButton>
        </div>
      </div>
      <div className={classes.projectList}>
        {projects.status === API_STATUS.LOADING && (
          <div className={classes.spinner}>
            <Spinner size={50} show={true} />
          </div>
        )}
        {projects?.data?.length === 0 && (
          <div className={classes.projectNotFound}>
            <img
              src={`${config.cfMsdAssetUrl}/icons/no-projects-found.svg`}
              alt='Project Not Found'
            />
            <p className={classes.mainText}>Coudn’t find the Project</p>
            <p className={classes.subText}>Please refine your search</p>
          </div>
        )}
        {projects.status !== API_STATUS.LOADING &&
          projects?.data?.map((project) => (
            <ProjectListItem
              project={project}
              onDeleteProject={onDeleteProject}
              onEditProjectClicked={onEditProjectClicked}
            />
          ))}
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(ProjectsList)

export default styleComponent
