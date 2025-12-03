import {Drawer} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Input} from '../../../bit-components/input/index'
import {setUniqueCodespace} from '../../../modules/workspace/pages/actions'
import {
  CheckUniqueCodespaceInput,
  SelectionOnData as CheckUniqueCodeaspaceSelectionOnData
} from '../../../modules/workspace/pages/graphqlApis/checkUniqueCodespace/checkUniqueCodespace'
import {checkUniqueCodespace} from '../../../modules/workspace/pages/graphqlApis/checkUniqueCodespace/checkUniqueCodespace.thunk'
import {SelectionOnGetCodespaces} from '../../../modules/workspace/pages/graphqlApis/getCodespaces/getCodespaces'
import {IWorkspaceState} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import AttachClusterDropdown from '../attachClusterDropdown/attachClusterDropdown'
import styles from './createCodespaceDrawerJSS'

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  setOpen: (ev: React.KeyboardEvent | React.MouseEvent) => void
  onCreateCodespace: (codespaceName, cloneFrom, clusterId) => void
  codespaces: {
    status: API_STATUS
    data: SelectionOnGetCodespaces['data']
    error: any
  }
  projectId: any
  uniqueCodespaceData: {
    status: API_STATUS
    data: CheckUniqueCodeaspaceSelectionOnData
    error: any
  }
  checkUniqueCodespaceFunc: (payload: CheckUniqueCodespaceInput) => void
  resetUniqueCodespace: () => void
  createCodespaceState: {
    status: API_STATUS
  }
}

const clusterList = [{id: 1, value: 'cluster 1', label: 'cluster 1'}]

const onChangeCluster = (val: string) => {}
const onChangeCodespace = (val: string) => {}

const codespaceNameRegex = /^[A-Za-z][A-Za-z0-9-_ ]*$/

const CreateCodespaceDrawer = (props: IProps) => {
  const {
    setOpen,
    open,
    classes,
    onCreateCodespace,
    codespaces,
    projectId,
    uniqueCodespaceData,
    checkUniqueCodespaceFunc,
    resetUniqueCodespace,
    createCodespaceState
  } = props
  const codespaceList = codespaces?.data
    ? codespaces.data.map((codeSpace) => ({
        id: codeSpace.codespace_id,
        value: codeSpace.codespace_name,
        label: codeSpace.codespace_name
      }))
    : []
  const [codespaceName, setCodespaceName] = useState('')
  const [cloneFrom, setCloneFrom] = useState(null)
  const [attachCluster, setAttachCluster] = useState(null)

  useEffect(() => {
    return () => {
      resetUniqueCodespace()
    }
  }, [])

  const setGithubLinkFunc = (nameToSet) => {
    setCodespaceName(nameToSet)
    debouncedcheckUniqueCodespaceFunc({
      projectId,
      codespaceName: nameToSet
    })
  }

  const debouncedcheckUniqueCodespaceFunc = useCallback(
    debounce(checkUniqueCodespaceFunc, 500),
    []
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
          <div className={classes.headerContent}>Create Codespace</div>
        </div>
        <div className={classes.content}>
          <div className={classes.fieldWrapper}>
            <Input
              onClick={() => {}}
              name='Input'
              value={codespaceName}
              label='Codespace Name'
              onChange={(e) => setGithubLinkFunc(e.target.value)}
              error={
                ((uniqueCodespaceData.status === API_STATUS.SUCCESS ||
                  uniqueCodespaceData.status === API_STATUS.ERROR) &&
                  !uniqueCodespaceData?.data?.is_unique) ||
                isNotValidCodespaceName
              }
              assistiveText={
                isNotValidCodespaceName
                  ? 'Codespace name is invalid!'
                  : (uniqueCodespaceData.status === API_STATUS.SUCCESS ||
                      uniqueCodespaceData.status === API_STATUS.ERROR) &&
                    !uniqueCodespaceData?.data?.is_unique &&
                    'This codespace name already exists'
              }
            />
          </div>
          <div className={classes.fieldWrapper}>
            <Dropdown
              fieldVariant='withOutline'
              menuLists={codespaceList}
              label={'Clone From (Optional)'}
              onChange={(ev, val) => setCloneFrom(val)}
              dropDownValue={undefined}
              error={Boolean('')}
              assistiveText={Boolean('') && 'error.message'}
            />
          </div>
          <div className={classes.fieldWrapper}>
            <AttachClusterDropdown
              setSelectedCluster={(data) => {
                setAttachCluster(data)
              }}
            />
          </div>
        </div>
        <div className={classes.footer}>
          <Button
            buttonText={'create'}
            onClick={() => {
              if (!isNotValidCodespaceName)
                onCreateCodespace(
                  codespaceName,
                  cloneFrom?.value ?? null,
                  attachCluster?.id ?? null
                )
            }}
            variant={ButtonVariants.PRIMARY}
            disabled={
              !projectId ||
              !codespaceName ||
              !uniqueCodespaceData?.data?.is_unique ||
              createCodespaceState.status === API_STATUS.LOADING ||
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
  uniqueCodespaceData: state.workspaceProjectReducer.uniqueCodespace,
  createCodespaceState: state.workspaceProjectReducer.createCodespace
})

const mapDispatchToProps = (dispatch) => {
  return {
    checkUniqueCodespaceFunc: (payload: CheckUniqueCodespaceInput) =>
      checkUniqueCodespace(dispatch, payload),
    resetUniqueCodespace: () =>
      dispatch(
        setUniqueCodespace({
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
)(CreateCodespaceDrawer)

export default styleComponent
