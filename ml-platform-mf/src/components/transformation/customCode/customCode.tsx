import {FormControl, TextField} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {UseFormRegister} from 'react-hook-form'
import {compose} from 'redux'
import {featureCreationForm} from '../../../types/featureCreationType.type'

import styles from './customCodeJSS'

interface IProps extends WithStyles<typeof styles> {
  register: UseFormRegister<featureCreationForm>
  errors: {
    [x: string]: any
  }
}

const CustomCode = (props: IProps) => {
  const {classes} = props

  return (
    <div className={classes.root}>
      <FormControl fullWidth variant='outlined' className={classes.formControl}>
        <TextField
          id='outlined-search'
          label='S3 Path*'
          type='search'
          variant='outlined'
          size='small'
          {...props.register('s3Path', {
            required: {value: true, message: 'S3 path is a required field'}
          })}
        />
        <span className={classes.error}>{props.errors?.s3Path?.message}</span>
      </FormControl>

      <FormControl fullWidth variant='outlined' className={classes.formControl}>
        <TextField
          id='outlined-search'
          label='S3 - Class Name*'
          type='search'
          variant='outlined'
          size='small'
          {...props.register('s3ClassName', {
            required: {
              value: true,
              message: 'S3 Class Name is a required field'
            }
          })}
        />
        <span className={classes.error}>
          {props.errors?.s3ClassName?.message}
        </span>
      </FormControl>
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  CustomCode
)

export default styleComponent
