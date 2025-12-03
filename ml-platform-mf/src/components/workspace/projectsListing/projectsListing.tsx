import React, {Dispatch, useEffect, useMemo, useState} from 'react'

import {withStyles, WithStyles} from '@mui/styles'
import {Search} from '../../../bit-components/search/index'

import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  setCodespaces,
  setSelectedProject
} from '../../../modules/workspace/pages/actions'
import {getCodespaces} from '../../../modules/workspace/pages/graphqlApis/getCodespaces/getCodespaces.thunk'
import {getProjects} from '../../../modules/workspace/pages/graphqlApis/getProjects/getProjects.thunk'
import {
  ICodespaces,
  IProjectList,
  ISelectedCodespace,
  IWorkspaceState
} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import SearchBar from '../../searchBar'
import SpinnerBackdrop from '../../spinnerBackdrop/spinnerBackdrop'
import CodespaceList from '../codespaceList/codespaceList'
import ProjectsList from '../projectsList/projectsList'
import SortProject from '../sortProject/sortProject'
import styles from './projectListingJSS'

interface IProps extends WithStyles<typeof styles> {
  projectList: IProjectList
  selectedCodespace: ISelectedCodespace
  codespaces: ICodespaces
  getProjects: (data) => void
  getCodespaces: (data) => void
  setCodespaces: (payload: any) => any
  isMine: boolean
  selectedProject: any
  onImportProjectClicked: (
    event: React.KeyboardEvent | React.MouseEvent
  ) => void
  onCreateProjectClicked: (e: React.KeyboardEvent | React.MouseEvent) => void
  onCreateCodespaceClicked: () => void
  onDeleteCodespaceHandler: (projectId: string, codespaceId: string) => void
  onDeleteProject: (projectId: string) => void
  setSelectedProject: (payload: any) => any
  onEditProjectClicked: (projectId: string, projectName: string) => void
  onEditCodespaceClicked: (
    codesapceId: string,
    projectId: string,
    codespaceName: string
  ) => void
}

const ProjectsListing = (props: IProps) => {
  const {
    classes,
    projectList,
    codespaces,
    getProjects,
    isMine,
    selectedProject,
    selectedCodespace,
    getCodespaces,
    setCodespaces,
    onCreateProjectClicked,
    onImportProjectClicked,
    onCreateCodespaceClicked,
    onDeleteCodespaceHandler,
    onDeleteProject,
    setSelectedProject,
    onEditProjectClicked,
    onEditCodespaceClicked
  } = props
  const [searchProjectQuery, setSearchProjectQuery] = useState('')
  const [sortBy, setSortBy] = useState({
    id: 'last_updated',
    label: 'Last Updated'
  })

  const getProjectsDebounced = useMemo(() => debounce(getProjects), [])

  useEffect(() => {
    const data = {
      query: searchProjectQuery,
      myProjects: isMine,
      sortBy: sortBy.id,
      user: ''
    }
    getProjectsDebounced(data)
  }, [searchProjectQuery, sortBy, isMine])

  useEffect(() => {
    if (
      selectedProject &&
      selectedProject.projectId &&
      projectList?.status === API_STATUS.SUCCESS
    ) {
      const data = {
        projectId: selectedProject.projectId
      }
      getCodespaces(data)
    } else {
      setCodespaces({
        status: API_STATUS.INIT,
        data: null,
        error: null
      })
    }
  }, [selectedProject])

  useEffect(() => {
    if (projectList) {
      const isProjectExists = projectList?.data?.find(
        (project) => project?.project_id === selectedCodespace?.data?.project_id
      )

      if (isProjectExists) {
        setSelectedProject({
          projectId: selectedCodespace.data.project_id
        })
      } else {
        if (projectList?.data?.length > 0) {
          setSelectedProject({
            projectId: projectList.data[0].project_id
          })
        } else {
          setSelectedProject(null)
        }
      }
    } else {
      setSelectedProject(null)
    }
  }, [projectList])

  const onChangeSortBy = (value) => {
    setSortBy(value)
  }

  return (
    <div className={classes.projectListingContainer}>
      <div className={classes.header}>
        <div className={classes.searchContainer}>
          <SearchBar
            placeholder={'Search Projects'}
            value={searchProjectQuery}
            onValueChange={(value) => setSearchProjectQuery(value)}
          />
        </div>
        <SortProject sortBy={sortBy} onChangeSortBy={onChangeSortBy} />
      </div>
      <div className={classes.listings}>
        <div className={classes.projectsList}>
          <ProjectsList
            projects={projectList}
            onImportProjectClicked={onImportProjectClicked}
            onCreateProjectClicked={onCreateProjectClicked}
            onDeleteProject={onDeleteProject}
            onEditProjectClicked={onEditProjectClicked}
          />
        </div>
        <div className={classes.codespacesList}>
          <CodespaceList
            projectId={selectedProject?.projectId}
            codespaces={codespaces}
            onCreateCodespaceClicked={onCreateCodespaceClicked}
            onDeleteCodespaceClicked={onDeleteCodespaceHandler}
            onEditCodespaceClicked={onEditCodespaceClicked}
          />
        </div>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    getProjects: (payload) => getProjects(dispatch, payload),
    getCodespaces: (payload) => getCodespaces(dispatch, payload),
    setSelectedProject: (payload) => dispatch(setSelectedProject(payload)),
    setCodespaces: (payload) => dispatch(setCodespaces(payload))
  }
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  projectList: state.workspaceProjectReducer.projectList,
  selectedCodespace: state.workspaceProjectReducer.selectedCodespace,
  selectedProject: state.workspaceProjectReducer.selectedProject,
  codespaces: state.workspaceProjectReducer.codespaces
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ProjectsListing)

export default styleComponent
