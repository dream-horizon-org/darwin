import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'

import {Drawer} from '@mui/material'
import {Control, FieldError, FormState} from 'react-hook-form'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
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
}

const WorkflowUpdateDrawer = (props: IProps) => {
  const {
    classes,
    control,
    onCloseWorkflowCreateDrawer,
    onWorkflowCreate,
    formState,
    editMode,
    setValue
  } = props

  return (
    <div>
      <WorkflowCreateDrawerHeader
        onCloseWorkflowCreateDrawer={onCloseWorkflowCreateDrawer}
        editMode={editMode}
      />
      <WorkflowCreateForm
        control={control}
        formState={formState}
        editMode={editMode}
        setValue={setValue}
      />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowUpdateDrawer
)

export default StyleComponent
