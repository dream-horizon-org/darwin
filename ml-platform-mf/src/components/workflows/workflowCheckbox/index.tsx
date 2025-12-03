import {Checkbox} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {Control, Controller, FormState} from 'react-hook-form'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {INotificationPreference, TaskNotificationPreferencePath} from '../types'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IWorkflowCreateForm, any>
  formState?: FormState<IWorkflowCreateForm>
  name: INotificationPreference | TaskNotificationPreferencePath
  key: string
  isDisabled?: boolean
  labelText: string
  defaultValue?: boolean
}

const WorkflowCheckbox = (props: IProps) => {
  const {
    classes,
    control,
    formState,
    key,
    name,
    isDisabled,
    defaultValue = false,
    labelText
  } = props

  return (
    <div className={classes.checkbox}>
      <Controller
        key={key}
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({field: {name, onChange, value}, fieldState: {error}}) => (
          <Checkbox
            name={name}
            className={classes.selectCheckbox}
            checked={value}
            disabled={isDisabled}
            onChange={(ev) => {
              onChange(ev.target.checked)
            }}
          />
        )}
      />
      <p className={classes.labelText}>{labelText}</p>
    </div>
  )
}

export default withStyles(styles)(WorkflowCheckbox)
