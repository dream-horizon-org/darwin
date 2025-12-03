import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {Tooltip} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import React from 'react'

import {FieldError} from 'react-hook-form'
import {Handle, Position} from 'reactflow'
import {sourceTypes} from '../../../modules/workflows/constants'
import {IWorkflowTaskForm} from '../../../modules/workflows/types/common.types'
import useStyles from './indexJSS'

interface IData extends IWorkflowTaskForm {
  selectedTask: string
  onDeleteTask: (task: IWorkflowTaskForm) => void
  onAddTask: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  taskFieldState: {
    invalid: boolean
    isDirty: boolean
    isTouched: boolean
    error?: FieldError
  }
  selectedTaskId: string
  tasksCount: number
  isDeleteDisable: boolean
  editMode: boolean
  isError: boolean
}

interface IProps {
  data: IData
}

const CustomNode = (props: IProps, isValid) => {
  const {data: task} = props
  const classes = useStyles()

  const getFilePath = () => {
    if (task.source === sourceTypes[0].value) {
      return task.workspacePath
    } else if (task.source === sourceTypes[1].value) {
      return task.filePath
    }
  }

  const shouldShowAddTaskIcon = () => {
    return task.editMode
      ? !task.taskFieldState.error
      : !task.selectedTaskId &&
          task.taskFieldState.isTouched &&
          !task.taskFieldState.error
  }

  return (
    <div>
      <div
        className={`${classes.nodeContainer} ${
          task.selectedTaskId === task.id ? classes.selectedNode : ''
        } ${task.isError ? classes.errorNode : ''}`}
        data-testid='workflow-task-node'
      >
        <Handle type='target' position={Position.Left} />
        <Tooltip title={task.name}>
          <div
            className={classes.nodeTitleContainer}
            data-testid='node-task-name'
          >
            {task.name || 'Untitled Task'}
          </div>
        </Tooltip>
        <div className={classes.description}>
          <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
          <Tooltip title={getFilePath()}>
            <span
              className={classes.descriptionText}
              data-testid='node-source-file'
            >
              {getFilePath() || 'No File Selected'}
            </span>
          </Tooltip>
        </div>
        <div className={classes.description}>
          <img
            src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
          />
          <Tooltip title={task.cluster?.name || ''}>
            <span
              className={classes.descriptionText}
              data-testid='node-cluster'
            >
              {task.cluster?.name || 'No cluster attached'}
            </span>
          </Tooltip>
        </div>
        <Handle type='source' position={Position.Right} />
      </div>
      <div className={classes.actionIcons}>
        {!task.isDeleteDisable && (
          <div
            className={classes.iconContainer}
            onClick={(ev) => {
              ev.stopPropagation()
              task.onDeleteTask(task)
            }}
            data-testid='workflow-delete-task-button'
          >
            <DeleteIcon />
          </div>
        )}
        {shouldShowAddTaskIcon() && (
          <div
            className={`${classes.iconContainer} ${classes.addIcon}`}
            onClick={(ev) => {
              ev.stopPropagation()
              task.onAddTask(ev)
            }}
            data-testid='workflow-add-new-task-button'
          >
            <AddIcon />
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomNode
