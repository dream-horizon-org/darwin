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
import {
  setImportProject,
  setUniqueLink
} from '../../../modules/workspace/pages/actions'
import {
  CheckUniqueLinkInput,
  SelectionOnData as CheckUniqueLinkSelectionOnData
} from '../../../modules/workspace/pages/graphqlApis/checkUniqueLink/checkUniqueLink'
import {checkUniqueLink} from '../../../modules/workspace/pages/graphqlApis/checkUniqueLink/checkUniqueLink.thunk'
import {IWorkspaceState} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import AttachClusterDropdown from '../attachClusterDropdown/attachClusterDropdown'
import styles from './importProjectDrawerJSS'

const githubLinkRegex = /^(http(s)?)(:\/\/github\.com\/.+\.git)$/

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  setOpen: (ev: React.KeyboardEvent | React.MouseEvent) => void
  onImportProject: (
    githubUrl: string,
    codespaceName: string,
    clusterId: string
  ) => void
  uniqueLinkData: {
    status: API_STATUS
    data: CheckUniqueLinkSelectionOnData
    error: any
  }
  checkUniqueLinkFunc: (payload: CheckUniqueLinkInput) => void
  resetImportProjectState: () => void
  resetUniqueLink: () => void
}

const clusterList = [{id: 1, value: 'cluster 1', label: 'cluster 1'}]
const codespaceList = [{id: 1, value: 'codespace 1', label: 'codespace 1'}]

const onChangeCluster = (val: string) => {}

const codespaceNameRegex = /^[A-Za-z][A-Za-z0-9-_ ]*$/

const ImportProjectDrawer = (props: IProps) => {
  const {
    setOpen,
    open,
    classes,
    onImportProject,
    uniqueLinkData,
    checkUniqueLinkFunc,
    resetImportProjectState,
    resetUniqueLink
  } = props
  const [githubLink, setGithubLink] = useState('')
  const [codespaceName, setCodespaceName] = useState('Main')
  const [cluster, setCluster] = useState(null)

  const setGithubLinkFunc = (linkToSet) => {
    setGithubLink(linkToSet)
    debouncedCheckUnique({
      githubLink: linkToSet
    })
  }

  const debouncedCheckUnique = useCallback(
    debounce(checkUniqueLinkFunc, 500),
    []
  )

  useEffect(() => {
    return () => {
      resetImportProjectState()
      resetUniqueLink()
    }
  }, [])

  const isNotValidGithubUrl = Boolean(
    githubLink && !githubLinkRegex.test(githubLink)
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
          <div className={classes.headerContent}>Import Project</div>
        </div>
        <div className={classes.content}>
          <div className={classes.fieldWrapper}>
            <Input
              onClick={() => {}}
              name='github_link'
              value={githubLink}
              label='Github Link'
              onChange={(e) => setGithubLinkFunc(e.target.value)}
              error={
                ((uniqueLinkData.status === API_STATUS.SUCCESS ||
                  uniqueLinkData.status === API_STATUS.ERROR) &&
                  !uniqueLinkData?.data?.is_unique) ||
                isNotValidGithubUrl
              }
              assistiveText={
                isNotValidGithubUrl
                  ? 'Invalid URL!'
                  : (uniqueLinkData.status === API_STATUS.SUCCESS ||
                      uniqueLinkData.status === API_STATUS.ERROR) &&
                    !uniqueLinkData?.data?.is_unique &&
                    'This project has been already imported, you can create new codespace inside that project!'
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
            buttonText={'import'}
            onClick={() => {
              if (
                githubLink &&
                codespaceName &&
                cluster &&
                !isNotValidGithubUrl &&
                !isNotValidCodespaceName
              ) {
                onImportProject(githubLink, codespaceName, cluster.id)
              }
            }}
            variant={ButtonVariants.PRIMARY}
            disabled={
              !githubLink ||
              !codespaceName ||
              !cluster ||
              isNotValidGithubUrl ||
              !uniqueLinkData?.data?.is_unique ||
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
  uniqueLinkData: state.workspaceProjectReducer.uniqueLink
})

const mapDispatchToProps = (dispatch) => {
  return {
    checkUniqueLinkFunc: (payload: CheckUniqueLinkInput) =>
      checkUniqueLink(dispatch, payload),
    resetUniqueLink: () =>
      dispatch(
        setUniqueLink({
          status: API_STATUS.INIT,
          data: null,
          error: null
        })
      ),
    resetImportProjectState: () =>
      dispatch(
        setImportProject({
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
)(ImportProjectDrawer)

export default styleComponent
