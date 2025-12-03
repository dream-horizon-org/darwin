import React from 'react'
import {FilterExpDialogStyles} from './filterExpDialogJSS'

interface NoFilterDisplayComponentProps {
  secondaryString?: string
  isNoResultDueToError?: boolean
}

export const NoFilterDisplayComponent = (
  props: NoFilterDisplayComponentProps
) => {
  const classes = FilterExpDialogStyles()
  return (
    <div className={classes.loaderContainer}>
      <div className={classes.noFilterContainer}>
        <span
          role='img'
          aria-label='noFilter'
          className={classes.noFilterEmoji}
        >
          🍃
        </span>
      </div>
      {props.isNoResultDueToError && (
        <div className={classes.noFilterContainer}>
          <p className={classes.noFilterText}>Oops!</p>
        </div>
      )}
      <div className={classes.noFilterContainer}>
        <p className={classes.noFilterText}>
          {props.secondaryString
            ? props.secondaryString
            : `Nothing is here yet.`}
        </p>
      </div>
    </div>
  )
}
