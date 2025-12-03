import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'

import {Drawer} from '@mui/material'
import {Control, FieldError, FormState} from 'react-hook-form'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {API_STATUS} from '../../../utils/apiUtils'
import WorkflowCreateDrawerHeader from '../workflowCreateDrawerHeader'
import WorkflowCreateFooter from '../workflowCreateFooter'
import WorkflowCreateForm from '../workflowCreateForm'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IWorkflowCreateForm, any>
  onCloseWorkflowCreateDrawer: () => void
  onWorkflowCreate: (
    e?: React.BaseSyntheticEvent<object, any, any>
  ) => Promise<void>
  formState: FormState<IWorkflowCreateForm>
  editMode?: boolean
  setValue: (name: string, value: any) => void
  workflowAPIStatus: API_STATUS
}

const WorkflowCreateDrawer = (props: IProps) => {
  const {
    classes,
    control,
    onCloseWorkflowCreateDrawer,
    onWorkflowCreate,
    formState,
    editMode,
    workflowAPIStatus,
    setValue
  } = props

  return (
    <Drawer
      anchor={'right'}
      open={true}
      onClose={onCloseWorkflowCreateDrawer}
      className={classes.createDrawer}
      classes={{
        paper: classes.createDrawer
      }}
    >
      <WorkflowCreateDrawerHeader
        onCloseWorkflowCreateDrawer={onCloseWorkflowCreateDrawer}
      />
      <WorkflowCreateForm
        control={control}
        formState={formState}
        editMode={editMode}
        setValue={setValue}
      />
      <WorkflowCreateFooter
        onWorkflowCreate={onWorkflowCreate}
        editMode={editMode}
        workflowAPIStatus={workflowAPIStatus}
      />
    </Drawer>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowCreateDrawer
)

export default StyleComponent
