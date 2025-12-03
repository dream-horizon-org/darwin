import React from 'react'

import {WithStyles, withStyles} from '@mui/styles'
import {
  Control,
  FormState,
  UseFormSetValue,
  UseFormTrigger
} from 'react-hook-form'
import {ISidepanel} from '../../../modules/workflows/pages/workflowCreate'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import TaskCreateFooter from '../taskCreateFooter'
import TaskCreateForm from '../taskCreateForm'
import TaskCreateHeader from '../taskCreateHeader'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IWorkflowCreateForm, any>
  taskIdx: number
  setValue: UseFormSetValue<IWorkflowCreateForm>
  onTaskAdd: () => void
  onCloseTaskDrawer: () => void
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  editMode: boolean
  trigger: UseFormTrigger<IWorkflowCreateForm>
  formState: FormState<IWorkflowCreateForm>
}

const WorkflowTaskContainer = (props: IProps) => {
  const {
    classes,
    control,
    taskIdx,
    setValue,
    onTaskAdd,
    onCloseTaskDrawer,
    setSidepanel,
    editMode,
    trigger,
    formState
  } = props

  return (
    <div className={classes.container}>
      <TaskCreateHeader onCloseTaskDrawer={onCloseTaskDrawer} />
      <TaskCreateForm
        control={control}
        taskIdx={taskIdx}
        setValue={setValue}
        setSidepanel={setSidepanel}
        trigger={trigger}
        formState={formState}
      />
      <TaskCreateFooter
        formState={formState}
        onTaskAdd={onTaskAdd}
        editMode={editMode}
      />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowTaskContainer
)

export default StyleComponent
