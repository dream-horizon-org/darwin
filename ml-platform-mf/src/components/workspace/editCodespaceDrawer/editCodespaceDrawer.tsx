import {CircularProgress, Drawer} from '@mui/material'
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
import {setUniqueCodespace} from '../../../modules/workspace/pages/actions'
import {
  CheckUniqueCodespaceInput,
  SelectionOnData as CheckUniqueCodeaspaceSelectionOnData
} from '../../../modules/workspace/pages/graphqlApis/checkUniqueCodespace/checkUniqueCodespace'
import {checkUniqueCodespace} from '../../../modules/workspace/pages/graphqlApis/checkUniqueCodespace/checkUniqueCodespace.thunk'
import {
  IEditCodespace,
  IWorkspaceState
} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import Spinner from '../../spinner/spinner'
import styles from './editCodespaceDrawerJSS'

interface IProps extends WithStyles<typeof styles> {
  open: boolean
  setOpen: (ev: React.KeyboardEvent | React.MouseEvent) => void
  onEditCodespace: (codespaceName, codespaceId, projectId) => void
  projectId: string
  oldCodespaceName: string
  codespaceId: string
  uniqueCodespaceData: {
    status: API_STATUS
    data: CheckUniqueCodeaspaceSelectionOnData
    error: any
  }
  checkUniqueCodespaceFunc: (payload: CheckUniqueCodespaceInput) => void
  resetUniqueCodespace: () => void
  editCodespaceResponse: IEditCodespace
}

const codespaceNameRegex = /^[A-Za-z][A-Za-z0-9-_ ]*$/

const EditCodespaceDrawer = (props: IProps) => {
  const {
    setOpen,
    open,
    classes,
    projectId,
    uniqueCodespaceData,
    checkUniqueCodespaceFunc,
    resetUniqueCodespace,
    onEditCodespace,
    oldCodespaceName,
    codespaceId,
    editCodespaceResponse
  } = props

  const [codespaceName, setCodespaceName] = useState(oldCodespaceName)

  useEffect(() => {
    setCodespaceName(oldCodespaceName)
  }, [oldCodespaceName])

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
          <div className={classes.headerContent}>
            Edit Codespace {oldCodespaceName}
          </div>
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
        </div>
        <div className={classes.footer}>
          {editCodespaceResponse.status === API_STATUS.LOADING ? (
            <CircularProgress size={30} />
          ) : (
            <Button
              buttonText={'Update'}
              onClick={() => {
                if (!isNotValidCodespaceName)
                  onEditCodespace(codespaceName, codespaceId, projectId)
              }}
              variant={ButtonVariants.PRIMARY}
              disabled={
                !projectId ||
                !codespaceName ||
                !uniqueCodespaceData?.data?.is_unique ||
                isNotValidCodespaceName
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
  uniqueCodespaceData: state.workspaceProjectReducer.uniqueCodespace,
  editCodespaceResponse: state.workspaceProjectReducer.editCodespace
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
)(EditCodespaceDrawer)

export default styleComponent
