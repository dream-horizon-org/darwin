import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import NoteIcon from '@mui/icons-material/Note'
import {Skeleton} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useRef} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dialog} from '../../../bit-components/dialog/index'
import {
  CodespaceFolders,
  CodespaceFoldersInput
} from '../../../modules/workflows/graphqlAPIs/codespaceFolders'
import {getCodespaceFolders} from '../../../modules/workflows/graphqlAPIs/codespaceFolders/index.thunk'
import {GetCodespacesInput} from '../../../modules/workflows/graphqlAPIs/getCodespaces/getCodespaces'
import {getCodespaces} from '../../../modules/workflows/graphqlAPIs/getCodespaces/getCodespaces.thunk'
import {GetProjectsInput} from '../../../modules/workflows/graphqlAPIs/getProjects/getProjects'
import {getProjects} from '../../../modules/workflows/graphqlAPIs/getProjects/getProjects.thunk'
import {getAllWorkspaces} from '../../../modules/workflows/graphqlAPIs/workspaces/index.thunk'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  getProjectsFunc: (data: GetProjectsInput) => void
  getAllWorkspacesFunc: () => void
  getCodespacesFunc: (data: GetCodespacesInput) => void
  getCodespaceFoldersFunc: (data: CodespaceFoldersInput) => void
  allWorkspaces: IWorkflowsState['allWorkspaces']
  allProjects: IWorkflowsState['allProjects']
  projectCodespaces: IWorkflowsState['projectCodespaces']
  codespaceFolders: IWorkflowsState['codespaceFolders']
  setSelectedNotebookPath: (path: string) => void
  isDialogOpen: boolean
  setIsDialogOpen: (val: boolean) => void
}

const CodespacePathSelectionModal = (props: IProps) => {
  const {
    classes,
    getProjectsFunc,
    getAllWorkspacesFunc,
    getCodespacesFunc,
    getCodespaceFoldersFunc,
    allWorkspaces,
    allProjects,
    projectCodespaces,
    codespaceFolders,
    setSelectedNotebookPath,
    isDialogOpen,
    setIsDialogOpen
  } = props

  const [selectedWorkspace, setSelectedWorkspace] = React.useState('')
  const [selectedProject, setSelectedProject] = React.useState('')
  const [selectedProjectName, setSelectedProjectName] = React.useState('')
  const [selectedCodespace, setSelectedCodespace] = React.useState('')
  const [selectedCodespaceName, setSelectedCodespaceName] = React.useState('')
  const [codespaceLevelArray, setCodespaceLevelArray] = React.useState([])
  const parentDivRef = useRef(null)

  const getPathToDisplay = (path) => path?.split('/').slice(3).join(' / ')

  const getFolderDiv = (
    folder: CodespaceFolders['codespaceFolders']['data'],
    folderStatus: API_STATUS,
    currentPath: string,
    pathLevel: number = 0
  ): JSX.Element => {
    if (folderStatus !== API_STATUS.LOADING && (!folder || !currentPath))
      return null

    return (
      <div className={classes.modalGridItem}>
        <div className={classes.pathTitle}>
          {getPathToDisplay(currentPath) || '/'}
        </div>
        <ul className={classes.fileListContainer}>
          {folderStatus === API_STATUS.LOADING && loader}
          {folder?.sub_folders?.map((folder, fIdx) => {
            return (
              <li
                className={`${classes.folderListItemContainer} ${
                  codespaceLevelArray[pathLevel] === folder.name && 'selected'
                }`}
                key={folder.name}
                onClick={() => {
                  const newArr = codespaceLevelArray.splice(0, pathLevel)
                  setCodespaceLevelArray([...newArr, folder.name])
                  getCodespaceFoldersFunc({
                    codespaceId: selectedCodespace,
                    folderPath: currentPath + folder.name + '/'
                  })
                }}
              >
                <div className={classes.listItemIcon}>
                  <FolderOpenIcon />
                </div>
                <div className={classes.listItemText}>{folder.name}</div>
              </li>
            )
          })}
          {folder?.files?.map((file) => {
            return (
              <li
                className={classes.folderListItemContainer}
                key={file.name}
                onClick={() => {
                  const newArr = codespaceLevelArray.splice(0, pathLevel)
                  const finalPath = [
                    selectedWorkspace,
                    selectedProjectName,
                    selectedCodespaceName,
                    ...newArr,
                    file.name
                  ].join('/')
                  setSelectedNotebookPath(finalPath)
                  setIsDialogOpen(false)
                }}
                data-testid='workflow-codespace-files-list-item'
              >
                <div className={classes.listItemIcon}>
                  <NoteIcon />
                </div>
                <div className={classes.listItemText}>{file.name}</div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  const getFolderDivFromPath = () => {
    const divsArr: JSX.Element[] = []
    if (!selectedCodespace) return divsArr
    const selectedCodespaceStore =
      (codespaceFolders || {})[selectedCodespace] || {}
    let prevPath =
      [selectedWorkspace, selectedProjectName, selectedCodespaceName].join(
        '/'
      ) + '/'
    const firstLevelDiv = getFolderDiv(
      selectedCodespaceStore[prevPath]?.data || null,
      selectedCodespaceStore[prevPath]?.status || API_STATUS.INIT,
      prevPath,
      0
    )
    divsArr.push(firstLevelDiv)
    codespaceLevelArray.forEach((currentPath, idx) => {
      prevPath = prevPath + currentPath + '/'
      const currentLevelDiv = getFolderDiv(
        selectedCodespaceStore[prevPath]?.data || null,
        selectedCodespaceStore[prevPath]?.status || API_STATUS.INIT,
        prevPath,
        idx + 1
      )
      divsArr.push(currentLevelDiv)
    })

    return divsArr
  }

  useEffect(() => {
    getAllWorkspacesFunc()
  }, [])

  useEffect(() => {
    if (selectedWorkspace) {
      getProjectsFunc({
        myProjects: true,
        query: '',
        sortBy: 'name',
        user: selectedWorkspace
      })
      setSelectedProject('')
      setSelectedProjectName('')
      setSelectedCodespace('')
      setSelectedCodespaceName('')
      setCodespaceLevelArray([])
    }
  }, [selectedWorkspace])

  useEffect(() => {
    if (selectedProject) {
      getCodespacesFunc({
        projectId: selectedProject
      })
      setSelectedCodespace('')
      setSelectedCodespaceName('')
      setCodespaceLevelArray([])
    }
  }, [selectedProject])

  useEffect(() => {
    if (parentDivRef?.current)
      parentDivRef.current.scrollLeft = parentDivRef.current.scrollWidth
  }, [codespaceFolders])

  const projectListToShow =
    (allProjects || {})[selectedWorkspace]?.data?.map((project) => {
      return {
        value: project.project_id,
        label: project.project_name
      }
    }) || []

  const projectCodespacesToShow =
    (projectCodespaces || {})[selectedProject]?.data?.map((codespace) => {
      return {
        value: codespace.codespace_id,
        label: codespace.codespace_name
      }
    }) || []

  const handleBreadcrumbClick = (idx) => {
    switch (idx) {
      case 0:
        setSelectedProject('')
        setSelectedProjectName('')
        setSelectedCodespace('')
        setSelectedCodespaceName('')
        setCodespaceLevelArray([])
        break
      case 1:
        setSelectedCodespace('')
        setSelectedCodespaceName('')
        setCodespaceLevelArray([])
        break
      case 2:
        setCodespaceLevelArray([])
        break
      default:
        const removeFromIndex = idx - 2
        const newArr = codespaceLevelArray.slice(0, removeFromIndex)
        setCodespaceLevelArray(newArr)

        break
    }
  }

  const pathsToRender = useMemo(() => {
    const paths = [
      selectedWorkspace,
      selectedProjectName,
      selectedCodespaceName,
      ...codespaceLevelArray
    ].filter((a) => a)
    return paths
  }, [
    selectedWorkspace,
    selectedProjectName,
    selectedCodespaceName,
    codespaceLevelArray
  ])

  const loader = (
    <>
      <Skeleton
        variant='rectangular'
        width={'100%'}
        height={40}
        sx={{
          background: '#4D4D4D',
          borderRadius: '4px',
          marginBottom: '4px'
        }}
      />
      <Skeleton
        variant='rectangular'
        width={'100%'}
        height={40}
        sx={{
          background: '#4D4D4D',
          borderRadius: '4px',
          marginBottom: '4px'
        }}
      />
      <Skeleton
        variant='rectangular'
        width={'100%'}
        height={40}
        sx={{
          background: '#4D4D4D',
          borderRadius: '4px',
          marginBottom: '4px'
        }}
      />
    </>
  )

  return (
    <Dialog
      handleClose={() => setIsDialogOpen(false)}
      title='Select Notebook Path'
      open={isDialogOpen}
      dialogContent={
        <>
          <div className={classes.selectedPath}>
            {pathsToRender.map((a, index) => {
              return (
                <div className={classes.breadCrumbContainer}>
                  <div
                    className={classes.breadcrumbElement}
                    onClick={() => {
                      handleBreadcrumbClick(index)
                    }}
                  >
                    {a}
                  </div>
                  {index !== pathsToRender.length - 1 && <div>/</div>}
                </div>
              )
            })}
          </div>
          <div className={classes.modalContainer}>
            <div className={classes.modalGridContainer} ref={parentDivRef}>
              <div className={classes.modalGridItem}>
                <div className={classes.pathTitle}>Workspaces:</div>
                <ul className={classes.fileListContainer}>
                  {allWorkspaces.status === API_STATUS.LOADING && loader}
                  {allWorkspaces.data?.map((workspaceId) => {
                    return (
                      <li
                        className={`${classes.folderListItemContainer} ${
                          selectedWorkspace === workspaceId && 'selected'
                        }`}
                        key={workspaceId}
                        onClick={() => {
                          setSelectedWorkspace(workspaceId)
                        }}
                        data-testid='workflow-worrkspaces-list-item'
                      >
                        <div className={classes.listItemIcon}>
                          <FolderOpenIcon />
                        </div>
                        <div className={classes.listItemText}>
                          {workspaceId}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className={classes.modalGridItem}>
                <div className={classes.pathTitle}>Projects:</div>
                <ul className={classes.fileListContainer}>
                  {(allProjects || {})[selectedWorkspace]?.status ===
                    API_STATUS.LOADING && loader}
                  {projectListToShow.map((project) => {
                    return (
                      <li
                        className={`${classes.folderListItemContainer} ${
                          project.value === selectedProject && 'selected'
                        }`}
                        key={project.value}
                        onClick={() => {
                          setSelectedProject(project.value)
                          setSelectedProjectName(project.label)
                        }}
                        data-testid='workflow-projects-list-item'
                      >
                        <div className={classes.listItemIcon}>
                          <FolderOpenIcon />
                        </div>
                        <div className={classes.listItemText}>
                          {project.label}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className={classes.modalGridItem}>
                <div className={classes.pathTitle}>Codespaces:</div>
                <ul className={classes.fileListContainer}>
                  {selectedProject &&
                    (projectCodespaces || {})[selectedProject]?.status ===
                      API_STATUS.LOADING &&
                    loader}
                  {selectedProject &&
                    projectCodespacesToShow.map((codespace) => {
                      return (
                        <li
                          className={`${classes.folderListItemContainer} ${
                            codespace.value === selectedCodespace && 'selected'
                          }`}
                          key={codespace.value}
                          onClick={() => {
                            setSelectedCodespace(codespace.value)
                            setSelectedCodespaceName(codespace.label)
                            getCodespaceFoldersFunc({
                              codespaceId: codespace.value,
                              folderPath:
                                [
                                  selectedWorkspace,
                                  selectedProjectName,
                                  codespace.label
                                ].join('/') + '/'
                            })
                          }}
                          data-testid='workflow-codespaces-list-item'
                        >
                          <div className={classes.listItemIcon}>
                            <FolderOpenIcon />
                          </div>
                          <div className={classes.listItemText}>
                            {codespace.label}
                          </div>
                        </li>
                      )
                    })}
                </ul>
              </div>
              {selectedWorkspace &&
                selectedProject &&
                selectedCodespace &&
                getFolderDivFromPath().map((El) => El)}
            </div>
          </div>
        </>
      }
    />
  )
}

const mapStateToProps = (state: CommonState) => ({
  allWorkspaces: state.workflowsReducer.allWorkspaces,
  allProjects: state.workflowsReducer.allProjects,
  projectCodespaces: state.workflowsReducer.projectCodespaces,
  codespaceFolders: state.workflowsReducer.codespaceFolders
})

const mapDispatchToProps = (dispatch) => {
  return {
    getAllWorkspacesFunc: () => getAllWorkspaces(dispatch),
    getProjectsFunc: (data: GetProjectsInput) => getProjects(dispatch, data),
    getCodespacesFunc: (data: GetCodespacesInput) =>
      getCodespaces(dispatch, data),
    getCodespaceFoldersFunc: (data: CodespaceFoldersInput) =>
      getCodespaceFolders(dispatch, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(CodespacePathSelectionModal)

export default StyleComponent
