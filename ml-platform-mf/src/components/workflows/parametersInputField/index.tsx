import CloseIcon from '@mui/icons-material/Close'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {Control, Controller, FormState} from 'react-hook-form'
import {Input} from '../../../bit-components/input/index'
import {
  IWorkflowCreateForm,
  IWorkflowTaskForm,
  IWorkflowTaskParams
} from '../../../modules/workflows/types/common.types'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  taskIdx: number
  parameterIdx: number
  tasks: IWorkflowTaskForm[]
  onClose: (parameterIdx: number) => void
  control: Control<IWorkflowCreateForm, any>
  parameter: IWorkflowTaskParams
  errorMessage: string
}

const ParametersInputField = (props: IProps) => {
  const {
    classes,
    control,
    taskIdx,
    tasks,
    parameterIdx,
    onClose,
    parameter,
    errorMessage
  } = props

  return (
    <div>
      <div
        className={classes.parametersContainer}
        key={`${taskIdx}-${parameter.id}`}
      >
        <Controller
          key={`${taskIdx}-${parameter.id}-1`}
          name={`tasks.${taskIdx}.parameters.${parameterIdx}.label`}
          control={control}
          render={({field, fieldState: {error}}) => (
            <Input
              {...field}
              label='Label'
              value={field.value || ''}
              error={Boolean(error)}
            />
          )}
        />

        <Controller
          key={`${taskIdx}-${parameter.id}-2`}
          name={`tasks.${taskIdx}.parameters.${parameterIdx}.value`}
          control={control}
          render={({field, fieldState: {error}}) => (
            <Input
              {...field}
              label='Value'
              value={field.value || ''}
              error={Boolean(error)}
            />
          )}
        />

        <CloseIcon
          className={`${classes.closeIcon} `}
          onClick={() => onClose(parameterIdx)}
        />
      </div>

      {errorMessage && (
        <div className={classes.errorMessage}>{errorMessage}</div>
      )}
    </div>
  )
}

export default withStyles(styles)(ParametersInputField)
