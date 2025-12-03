import {WithStyles, withStyles} from '@mui/styles'
import React, {useState} from 'react'
import {Control, Controller} from 'react-hook-form'
import {compose} from 'redux'
import {Input} from '../../../bit-components/input/index'
import {IComputeLibraryFormData} from '../../../types/compute/common.type'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  control: Control<IComputeLibraryFormData, any>
}

const S3Path = (props: IProps) => {
  const {classes, control} = props

  return (
    <div>
      <div className={`${classes.inputWithInfoMessage} ${classes.s3Heading}`}>
        <Controller
          name='filePath'
          control={control}
          render={({field, fieldState: {error}}) => {
            return (
              <Input
                {...field}
                inputType='text'
                label='s3://'
                onChange={(ev) => {
                  field.onChange(ev.target.value)
                }}
                value={field?.value?.toString() || ''}
                error={Boolean(error?.message)}
                assistiveText={error?.message}
              />
            )
          }}
        />
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  S3Path
)

export default StyleComponent
