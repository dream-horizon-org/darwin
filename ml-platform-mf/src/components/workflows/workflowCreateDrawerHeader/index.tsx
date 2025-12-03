import CloseIcon from '@mui/icons-material/Close'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'

import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  onCloseWorkflowCreateDrawer: () => void
  editMode?: boolean
}

const WorkflowCreateDrawerHeader = (props: IProps) => {
  const {classes, onCloseWorkflowCreateDrawer, editMode} = props

  return (
    <div className={classes.headerContainer}>
      {!editMode && (
        <CloseIcon
          onClick={onCloseWorkflowCreateDrawer}
          className={classes.closeIcon}
        />
      )}
      <div className={classes.taskDetailsHeader}>
        {editMode ? 'Update Workflow' : 'New Workflow'}
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowCreateDrawerHeader
)

export default StyleComponent
