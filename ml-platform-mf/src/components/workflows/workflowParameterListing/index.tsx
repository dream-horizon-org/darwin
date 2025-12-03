import {Tooltip as TooltipMUI} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {truncate} from '../../../utils/helper'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  data: any
}

const WorkflowParameterListing = (props: IProps) => {
  const {classes, data} = props

  return (
    <div>
      <div className={classes.parameterContainer}>
        <div className={classes.parameterDataContainer}>
          <div className={classes.parameterHeadingLabel}>Key</div>
          {data && Object.keys(data).length > 0 ? (
            Object.keys(data).map((key, index) => (
              <TooltipMUI title={key.length > 25 ? key : ''}>
                <div key={index} className={classes.parametersDataValue}>
                  {truncate(key, 25)}
                </div>
              </TooltipMUI>
            ))
          ) : (
            <div>-</div>
          )}
        </div>
        <div className={classes.parameterDataContainer}>
          <div className={classes.parameterHeadingLabel}>Value</div>
          {data && Object.keys(data).length > 0 ? (
            Object.values(data).map((value: string, index) => {
              if (typeof value === 'object') {
                value = JSON.stringify(value)
              } else {
                value = value?.toString()
              }
              return (
                <TooltipMUI title={value.length > 25 ? value : ''}>
                  <div key={index} className={classes.parametersDataValue}>
                    {value ? truncate(value, 25) : '-'}
                  </div>
                </TooltipMUI>
              )
            })
          ) : (
            <div>-</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default withStyles(styles)(WorkflowParameterListing)
