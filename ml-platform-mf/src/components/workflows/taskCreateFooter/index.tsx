import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {Button, ButtonSizes} from '../../../bit-components/button/index'

import {FormState} from 'react-hook-form'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import styles from './indexJSS'

const ADD_TASK_BTN_LABEL = 'Add Task'
const UPDATE_TASK_BTN_LABEL = 'Save Changes'

interface IProps extends WithStyles<typeof styles> {
  onTaskAdd: () => void
  editMode: boolean
  formState: FormState<IWorkflowCreateForm>
}

const TaskCreateFooter = (props: IProps) => {
  const {onTaskAdd, classes, editMode, formState} = props

  return (
    <div className={classes.container}>
      <div data-testid='workflow-add-task-button'>
        <Button
          buttonText={editMode ? UPDATE_TASK_BTN_LABEL : ADD_TASK_BTN_LABEL}
          onClick={onTaskAdd}
          size={ButtonSizes.MEDIUM}
          disabled={editMode ? !formState.isDirty : false}
          data-testid='workflow-add-task-button'
        />
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(TaskCreateFooter)

export default StyleComponent
