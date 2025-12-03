import AddIcon from '@mui/icons-material/Add'
import {Tooltip} from '@mui/material'
import config from 'config'
import React from 'react'
import {FieldError, FormState, UseFormGetFieldState} from 'react-hook-form'
import {Edge, MarkerType, Node, Position} from 'reactflow'
import {SelectionOnTasks} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {
  WORKFLOW_STANDARDS_FAIL,
  WORKFLOW_STANDARDS_RUNNING,
  WORKFLOW_STANDARDS_SKIPPED,
  WORKFLOW_STANDARDS_SUCCESS,
  WORKFLOW_STANDARDS_UPSTREAM_FAIL
} from '../../../modules/workflows/pages/workflows/constants'
import {
  IWorkflowCreateForm,
  IWorkflowTaskForm
} from '../../../modules/workflows/types/common.types'
import {generateCoordinates} from './graphGenerator'

const getStatusClass = (status: string, classes) => {
  switch (status) {
    case WORKFLOW_STANDARDS_RUNNING:
      return classes.runningNode
    case WORKFLOW_STANDARDS_SUCCESS:
      return classes.successNode
    case WORKFLOW_STANDARDS_FAIL:
      return classes.errorNode
    case WORKFLOW_STANDARDS_UPSTREAM_FAIL:
      return classes.errorNode
    case WORKFLOW_STANDARDS_SKIPPED:
      return classes.skippedNode
    default:
      return ''
  }
}

const isDeleteDisable = (
  tasks: IWorkflowTaskForm[],
  task: IWorkflowTaskForm
) => {
  const dependentTasks = tasks.filter((t) => t.dependentOn.includes(task.id))
  return dependentTasks.length > 0 || tasks.length <= 1
}

const isTaskHavingError = (
  formState: FormState<IWorkflowCreateForm>,
  taskIdx: number
) => {
  return formState.errors.tasks && formState.errors.tasks[taskIdx]
    ? true
    : false
}

export const getInitialNodes = (
  classes,
  tasks: IWorkflowTaskForm[],
  showStatus = false,
  selectedTaskId: string = '',
  onDeleteTask: (task: IWorkflowTaskForm) => void,
  onAddTask: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  taskFieldState: {
    invalid: boolean
    isDirty: boolean
    isTouched: boolean
    error?: FieldError
  },
  editMode: boolean,
  formState: FormState<IWorkflowCreateForm>
): Node[] => {
  try {
    const updatedTasks = generateCoordinates(250, 300, tasks)
    return updatedTasks.map((task, tIdx) => {
      return {
        id: task.id,
        position: {x: task.x, y: task.y},
        style: {minWidth: 200, background: 'none'},
        type: 'customNode',
        data: {
          ...task,
          selectedTask: false,
          label: task.name,
          onDeleteTask: onDeleteTask,
          onAddTask: onAddTask,
          taskFieldState: taskFieldState,
          selectedTaskId: selectedTaskId,
          tasksCount: tasks.length,
          isDeleteDisable: isDeleteDisable(tasks, task),
          editMode: editMode,
          isError: isTaskHavingError(formState, tIdx)
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      }
    })
  } catch (e) {
    return []
  }
}

export const getIdForTaskName = (
  taskName: string,
  tasks: IWorkflowTaskForm[]
) => {
  const task = tasks.find((t) => t.name === taskName)
  return task ? task.id : ''
}

export const getInitialEdges = (tasks: IWorkflowTaskForm[]): Edge[] => {
  const edges: Edge[] = []
  tasks.forEach((task) => {
    task.dependentOn.forEach((prevTaskId) => {
      edges.push({
        id: `${prevTaskId}-${task.id}`,
        source: prevTaskId,
        target: task.id,
        markerEnd: {
          type: MarkerType.Arrow
        }
      })
    })
  })
  return edges
}
