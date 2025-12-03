import CloseIcon from '@mui/icons-material/Close'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import {
  TagsStatus,
  TagsStatusTypes
} from '../../../bit-components/tags/tags-status/index'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {parseSeconds} from '../../../utils/getDateString'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  onCloseDrawer: () => void
  workflowTaskDetails: IWorkflowsDetailsState['workflowTaskDetails']
  selctedTaskRetry: number
  onSelectedTaskRetryChange: (newRetry: number) => void
}

const TaskOutputDrawerHeader = (props: IProps) => {
  const {
    classes,
    onCloseDrawer,
    workflowTaskDetails,
    selctedTaskRetry,
    onSelectedTaskRetryChange
  } = props

  const getTaskRetryStatus = (status: string) => {
    switch (status) {
      case 'success':
        return TagsStatusTypes.Active
      case 'failed':
        return TagsStatusTypes.Error
      case 'running':
        return TagsStatusTypes.Information
    }
  }

  const getTaskRetryStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Success'
      case 'failed':
        return 'Failed'
      case 'running':
        return 'Running'
    }
  }

  return (
    <div className={classes.taskDetailsHeader}>
      <CloseIcon
        className={classes.closeIcon}
        onClick={onCloseDrawer}
        sx={{cursor: 'pointer'}}
      />
      <div className={classes.taskDetailsTitle}>
        Task Details for Run #{workflowTaskDetails?.data?.run_id}
      </div>
      <div className={classes.retriesSelectionContainer}>
        <Select
          labelId='demo-simple-select-label'
          id='demo-simple-select'
          value={selctedTaskRetry}
          onChange={(e) => onSelectedTaskRetryChange(Number(e.target.value))}
          size='small'
          className={classes.retriesSelectionDropdown}
        >
          {workflowTaskDetails?.data?.output.map((retry, index) => (
            <MenuItem value={index} key={index} className={classes.menuItem}>
              <div className={classes.left}>
                {index === 0 ? (
                  <div>Original Attempt</div>
                ) : (
                  <div>Attempt {index + 1}</div>
                )}
                <div className={classes.duration}>
                  ({parseSeconds(retry.duration)})
                  {index === workflowTaskDetails?.data?.output?.length - 1
                    ? ': latest'
                    : ''}
                </div>
              </div>
              <div className={classes.right}>
                <TagsStatus
                  status={getTaskRetryStatus(retry.status)}
                  text={getTaskRetryStatusText(retry.status)}
                />
              </div>
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  TaskOutputDrawerHeader
)

export default StyleComponent
