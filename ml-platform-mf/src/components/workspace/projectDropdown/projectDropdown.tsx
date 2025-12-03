import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {Box, Button, Menu, Tab, Tabs} from '@mui/material'
import React, {useEffect, useState} from 'react'

import {withStyles, WithStyles} from '@mui/styles'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {setSelectedProject} from '../../../modules/workspace/pages/actions'
import {getCountOfProjects} from '../../../modules/workspace/pages/graphqlApis/getCountOfProjects/getCountOfProjects.thunk'
import {
  ICountOfProjects,
  ISelectedCodespace,
  IWorkspaceState
} from '../../../modules/workspace/pages/reducer'
import {a11yProps} from '../../../utils/componentUtils'
import TabPanel from '../../tabpanel/tabpanel'
import ProjectsListing from '../projectsListing/projectsListing'
import styles from './projectDropdownJSS'
import {getProjectDropdownTabs} from './utils'

interface IProps extends WithStyles<typeof styles> {
  anchorEl: HTMLElement
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement>>
  selectedCodespace: ISelectedCodespace
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
  getCountOfProjects: () => any
  countOfProjects: ICountOfProjects
}

const ProjectDropdown = (props: IProps) => {
  const {
    classes,
    anchorEl,
    setAnchorEl,
    selectedCodespace,
    onImportProjectClicked,
    onCreateProjectClicked,
    onCreateCodespaceClicked,
    onDeleteCodespaceHandler,
    onDeleteProject,
    setSelectedProject,
    onEditProjectClicked,
    onEditCodespaceClicked,
    getCountOfProjects,
    countOfProjects
  } = props
  const [selectedTab, setSelectedTab] = useState(0)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    getCountOfProjects()
    setAnchorEl(event.currentTarget)
  }

  const menuCloseHandler = () => {
    setAnchorEl(null)
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedProject(null)
    setSelectedTab(newValue)
  }

  return (
    <div>
      <Button
        className={classes.menuButton}
        variant='outlined'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon className={classes.dropdownIcon} />}
      >
        <FolderOutlinedIcon fontSize='small' className={classes.menuIcon} />
        <span className={classes.mainProjectName}>
          {selectedCodespace?.data?.project_name}
        </span>
        <span className={classes.codespaceNameForProject}>
          {selectedCodespace?.data?.codespace_name}
        </span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={menuCloseHandler}
        PaperProps={{
          style: {
            width: '692px',
            background: 'rgb(51, 51, 51)',
            opacity: 1
          }
        }}
        className={classes.menu}
      >
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          aria-label='basic tabs example'
          className={classes.tabs}
        >
          {getProjectDropdownTabs(
            countOfProjects?.data?.my_projects,
            countOfProjects?.data?.other_projects
          ).map((tab) => (
            <Tab
              label={tab.label}
              icon={
                tab.projectCount && (
                  <div className={classes.projectCount}>{tab.projectCount}</div>
                )
              }
              iconPosition={tab.iconPosition}
              {...a11yProps(0)}
              key={tab.label}
            />
          ))}
        </Tabs>
        <TabPanel value={selectedTab} index={0}>
          <ProjectsListing
            isMine={true}
            onImportProjectClicked={onImportProjectClicked}
            onCreateProjectClicked={onCreateProjectClicked}
            onCreateCodespaceClicked={onCreateCodespaceClicked}
            onDeleteCodespaceHandler={onDeleteCodespaceHandler}
            onDeleteProject={onDeleteProject}
            onEditProjectClicked={onEditProjectClicked}
            onEditCodespaceClicked={onEditCodespaceClicked}
          />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <ProjectsListing
            isMine={false}
            onImportProjectClicked={onImportProjectClicked}
            onCreateProjectClicked={onCreateProjectClicked}
            onCreateCodespaceClicked={onCreateCodespaceClicked}
            onDeleteCodespaceHandler={onDeleteCodespaceHandler}
            onDeleteProject={onDeleteProject}
            onEditProjectClicked={onEditProjectClicked}
            onEditCodespaceClicked={onEditCodespaceClicked}
          />
        </TabPanel>
      </Menu>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedProject: (payload) => dispatch(setSelectedProject(payload)),
    getCountOfProjects: () => getCountOfProjects(dispatch)
  }
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  selectedCodespace: state.workspaceProjectReducer.selectedCodespace,
  countOfProjects: state.workspaceProjectReducer.countOfProjects
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ProjectDropdown)

export default styleComponent
