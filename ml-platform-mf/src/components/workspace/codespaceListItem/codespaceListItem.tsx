import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {Dialog} from '../../../bit-components/dialog/index'
import {DeleteCodespaceInput} from '../../../modules/workspace/pages/graphqlApis/deleteCodespace/deleteCodespace'
import {deleteCodespace} from '../../../modules/workspace/pages/graphqlApis/deleteCodespace/deleteCodespace.thunk'
import {SelectionOnData as Codespace} from '../../../modules/workspace/pages/graphqlApis/getCodespaces/getCodespaces'
import {getIntialsFromEmail} from '../../../modules/workspace/utils'

import {IconButton} from '@mui/material'
import {routes} from '../../../constants'
import {
  ISelectedCodespace,
  IWorkspaceState
} from '../../../modules/workspace/pages/reducer'
import styles from './codespaceListItemJSS'

interface IProps extends WithStyles<typeof styles> {
  codespace: Codespace
  projectId: string
  seletedCodespace: ISelectedCodespace
  onDeleteCodespaceClicked: (projectId: string, codespaceId: string) => void
  onEditCodespaceClicked: (
    codesapceId: string,
    projectId: string,
    codespaceName: string
  ) => void
  isOnlyCodespaceLeft: boolean
}

const CodespaceListItem = (props: IProps) => {
  const {
    classes,
    codespace,
    projectId,
    seletedCodespace,
    onDeleteCodespaceClicked,
    onEditCodespaceClicked,
    isOnlyCodespaceLeft
  } = props
  const [activateDialogOpen, setActivateDialogOpen] = useState({
    open: false
  })
  const history = useHistory()

  const openDialog = (e) => {
    e.stopPropagation()
    setActivateDialogOpen({
      open: true
    })
  }

  const redirectToNewCodepsace = (pId, cId) => {
    history.replace(
      `${routes.sharedWorkspace
        .replace(':pId', pId)
        .replace(':cId', cId)}/?lab_url=`
    )
  }

  const onCodespaceClicked = () => {
    redirectToNewCodepsace(projectId, codespace.codespace_id)
  }

  return (
    <div
      className={`${classes.container} ${
        seletedCodespace?.data?.codespace_id === codespace.codespace_id
          ? classes.active
          : ''
      }`}
      onClick={onCodespaceClicked}
    >
      <Dialog
        handleClose={(e) => {
          e.stopPropagation()
          setActivateDialogOpen({
            open: false
          })
        }}
        testIdentifier='deleteCodespace'
        title={'Delete Codespace'}
        open={activateDialogOpen.open}
        dialogContent={
          <div>{'Are you sure you want to delete this codespace ?'}</div>
        }
        dialogFooter={{
          primaryButton: {
            text: 'Delete',
            onClick: (e) => {
              e.stopPropagation()
              onDeleteCodespaceClicked(projectId, codespace?.codespace_id)
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
          {getIntialsFromEmail(codespace.created_by)}
        </div>
        <div className={classes.codespaceName}>{codespace.codespace_name}</div>
      </div>
      <div className={classes.right}>
        <IconButton
          className={classes.iconButton}
          onClick={(e) => {
            e.stopPropagation()
            onEditCodespaceClicked(
              codespace.codespace_id,
              projectId,
              codespace.codespace_name
            )
          }}
        >
          <ModeEditOutlineOutlinedIcon className={classes.rightIcon} />
        </IconButton>
        <IconButton
          className={classes.iconButton}
          disabled={isOnlyCodespaceLeft}
          onClick={openDialog}
        >
          <DeleteOutlineOutlinedIcon
            className={`${classes.rightIcon} ${
              isOnlyCodespaceLeft ? classes.disabledIcon : ''
            }`}
          />
        </IconButton>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteCodespace: (data: DeleteCodespaceInput) =>
      deleteCodespace(data, dispatch)
  }
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  seletedCodespace: state.workspaceProjectReducer.selectedCodespace
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(CodespaceListItem)

export default styleComponent
