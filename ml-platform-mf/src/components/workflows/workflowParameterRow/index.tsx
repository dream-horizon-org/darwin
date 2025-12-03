import CloseIcon from '@mui/icons-material/Close'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useState} from 'react'
import {Input} from '../../../bit-components/input/index'

import {Control, Controller} from 'react-hook-form'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  id: number
  key: string
  label: string
  value: string
  control: Control<any, any>
  onClose: (id: number) => void
  readOnly: boolean
  errorMessage?: string
}

const WorkflowParameterRow = (props: IProps) => {
  const {
    classes,
    id,
    key,
    label,
    value,
    control,
    onClose,
    readOnly,
    errorMessage
  } = props

  return (
    <div>
      <div className={classes.parametersContainer} key={key}>
        <Controller
          key={`${id}-1`}
          name={label}
          control={control}
          render={({field, fieldState: {error}}) => (
            <Input
              {...field}
              label='Label'
              value={field.value || ''}
              disabled={readOnly}
              error={Boolean(error)}
            />
          )}
        />

        <Controller
          key={`${id}-2`}
          name={value}
          control={control}
          render={({field, fieldState: {error}}) => {
            return (
              <Input
                {...field}
                label='Value'
                value={field.value || ''}
                disabled={readOnly}
                error={Boolean(error)}
              />
            )
          }}
        />

        {!readOnly && (
          <CloseIcon
            className={`${classes.closeIcon}`}
            onClick={() => onClose(id)}
          />
        )}
      </div>
      {errorMessage && (
        <div className={classes.errorMessage}>{errorMessage}</div>
      )}
    </div>
  )
}

export default withStyles(styles)(WorkflowParameterRow)
