import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import {IconButton} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {ICodespaces} from '../../../modules/workspace/pages/reducer'
import {API_STATUS} from '../../../utils/apiUtils'
import Spinner from '../../spinner/spinner'

import CodespaceListItem from '../codespaceListItem/codespaceListItem'
import styles from './codespaceListJSS'

interface IProps extends WithStyles<typeof styles> {
  codespaces: ICodespaces
  projectId: string
  onCreateCodespaceClicked: () => void
  onDeleteCodespaceClicked: (projectId: string, codespaceId: string) => void
  onEditCodespaceClicked: (
    codesapceId: string,
    projectId: string,
    codespaceName: string
  ) => void
}

const CodespaceList = (props: IProps) => {
  const {
    classes,
    codespaces,
    onCreateCodespaceClicked,
    projectId,
    onDeleteCodespaceClicked,
    onEditCodespaceClicked
  } = props

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.headerName}>Codespaces</div>
        <div>
          <IconButton>
            <AddOutlinedIcon
              fontSize='small'
              className={classes.icon}
              onClick={onCreateCodespaceClicked}
            />
          </IconButton>
        </div>
      </div>
      <div className={classes.codespaceListItem}>
        {codespaces?.status === API_STATUS.LOADING && (
          <div className={classes.spinner}>
            <Spinner size={50} show={true} />
          </div>
        )}
        {codespaces?.data?.length === 0 && (
          <div className={classes.codespaceNotFound}>
            <p className={classes.mainText}>No Codespaces Found</p>
          </div>
        )}
        {codespaces?.data?.map((codespace) => (
          <CodespaceListItem
            projectId={projectId}
            codespace={codespace}
            onDeleteCodespaceClicked={onDeleteCodespaceClicked}
            onEditCodespaceClicked={onEditCodespaceClicked}
            isOnlyCodespaceLeft={codespaces?.data?.length === 1}
          />
        ))}
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(CodespaceList)

export default styleComponent
