import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {Button, ButtonSizes} from '../../../bit-components/button/index'

import {API_STATUS} from '../../../utils/apiUtils'
import styles from './indexJSS'

const CREATE_WORKFLOW_LABEL = 'Create'
const UPDATE_WORKFLOW_LABEL = 'Update'

interface IProps extends WithStyles<typeof styles> {
  onWorkflowCreate: () => void
  editMode?: boolean
  workflowAPIStatus: API_STATUS
}

const WorkflowCreateFooter = (props: IProps) => {
  const {onWorkflowCreate, classes, editMode, workflowAPIStatus} = props

  return (
    <div className={classes.container}>
      <div data-testid='workflow-create-sidepanel-create-button'>
        <Button
          buttonText={editMode ? UPDATE_WORKFLOW_LABEL : CREATE_WORKFLOW_LABEL}
          onClick={onWorkflowCreate}
          size={ButtonSizes.MEDIUM}
          disabled={workflowAPIStatus === API_STATUS.LOADING}
        />
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowCreateFooter
)

export default StyleComponent
