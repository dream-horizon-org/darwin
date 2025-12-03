import React, {useEffect, useState} from 'react'
import {Dialog} from '../../../bit-components/dialog/index'

import {withStyles, WithStyles} from '@mui/styles'
import {connect} from 'react-redux'
import ReactFlow, {Background, BackgroundVariant, Controls} from 'reactflow'
import {compose} from 'redux'
import {Banner, Severity} from '../../../bit-components/banner/index'
import {Icons} from '../../../bit-components/icon/index'
import {RepairWorkflowRunInput} from '../../../modules/workflows/graphqlAPIs/repairWorkflowRun'
import {repairWorkflowRun} from '../../../modules/workflows/graphqlAPIs/repairWorkflowRun/index.thunk'
import {resetRepairWorkflowRun} from '../../../modules/workflows/pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {getInitialEdges, getInitialNodes} from '../workflowTasks/nodes'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
  open: boolean
  handleClose: () => void
  repairWorkflowRun: (payload: RepairWorkflowRunInput) => void
  repairWorkflowRunData: IWorkflowsDetailsState['repairRun']
  onRepairRunSuccess: () => void
  resetRepairWorkflowRun: () => void
}

const RepairRun = (props: IProps) => {
  const {
    classes,
    open,
    handleClose,
    workflowRunDetails,
    repairWorkflowRun,
    repairWorkflowRunData,
    onRepairRunSuccess,
    resetRepairWorkflowRun
  } = props
  const [selectedTasks, setSelectedTasks] = useState([])

  const onRepairRun = () => {
    repairWorkflowRun({
      workflowId: workflowRunDetails?.data?.workflow_id,
      runId: workflowRunDetails?.data?.run_id,
      selectedTasks: selectedTasks
    })
  }

  useEffect(() => {
    if (repairWorkflowRunData?.status === API_STATUS.SUCCESS) {
      resetRepairWorkflowRun()
      onRepairRunSuccess()
    }
  }, [repairWorkflowRunData])

  const getRemovedTasks = (taskName: string) => {
    const removedTasks = {}
    const queue = [taskName]
    while (queue.length > 0) {
      const task = queue.pop()
      removedTasks[task] = true
      workflowRunDetails.data.tasks.forEach((runTask) => {
        if (runTask.task_name === task) {
          runTask.depends_on.forEach((dependentTask) => {
            if (!(dependentTask in removedTasks)) {
              queue.push(dependentTask)
            }
          })
        }
      })
    }
    return Object.keys(removedTasks)
  }

  const getAddedTasks = (taskName: string) => {
    const addedTasks = {}
    const queue = [taskName]
    while (queue.length > 0) {
      const task = queue.pop()
      addedTasks[task] = true
      workflowRunDetails.data.tasks.forEach((runTask) => {
        if (runTask.depends_on.includes(task)) {
          if (!(runTask.task_name in addedTasks)) {
            queue.push(runTask.task_name)
          }
        }
      })
    }
    return Object.keys(addedTasks)
  }

  const onSelectedTaskChange = (taskName: string) => {
    if (selectedTasks.includes(taskName)) {
      const removedTask = getRemovedTasks(taskName)
      setSelectedTasks(
        selectedTasks.filter((task) => !removedTask.includes(task))
      )
    } else {
      const addedTasks = getAddedTasks(taskName)
      setSelectedTasks([...selectedTasks, ...addedTasks])
    }
  }

  const shouldCheckboxBeDisabled = (taskName: string) => {
    if (workflowRunDetails?.data?.tasks) {
      for (const task of workflowRunDetails.data.tasks) {
        if (task.task_name === taskName) {
          const dependsOn = task.depends_on
          for (const dependOn of dependsOn) {
            if (selectedTasks.includes(dependOn)) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  const [nodes, setNodes] = useState(
    getInitialNodes(
      classes,
      workflowRunDetails?.data?.tasks || [],
      true,
      '',
      true,
      selectedTasks,
      onSelectedTaskChange,
      shouldCheckboxBeDisabled
    )
  )

  const [edges, setEdges] = useState(
    getInitialEdges(workflowRunDetails?.data?.tasks || [])
  )

  const getDefaultSelectedTasks = () => {
    const failedTasks = workflowRunDetails.data.tasks
      .filter((task) => task.run_status === 'failed')
      .map((task) => task.task_name)

    const tasks = {}
    const queue = []
    failedTasks.forEach((task) => {
      tasks[task] = true
      queue.push(task)
    })

    const runTasks = workflowRunDetails.data.tasks
    while (queue.length > 0) {
      const task = queue.pop()
      tasks[task] = true
      runTasks.forEach((runTask) => {
        if (runTask.depends_on.includes(task)) {
          if (!(runTask.task_name in tasks)) {
            tasks[runTask.task_name] = true
            queue.push(runTask.task_name)
          }
        }
      })
    }

    return Object.keys(tasks)
  }

  useEffect(() => {
    if (workflowRunDetails?.data?.tasks) {
      setSelectedTasks(getDefaultSelectedTasks())
    }
  }, [workflowRunDetails])

  useEffect(() => {
    setNodes(
      getInitialNodes(
        classes,
        workflowRunDetails?.data?.tasks || [],
        true,
        '',
        true,
        selectedTasks,
        onSelectedTaskChange,
        shouldCheckboxBeDisabled
      )
    )
  }, [selectedTasks])

  useEffect(() => {
    if (repairWorkflowRunData?.status === API_STATUS.SUCCESS) {
    }
  }, [repairWorkflowRunData])

  return (
    <Dialog
      handleClose={handleClose}
      title='Select the task where you want to repair this run from'
      open={open}
      dialogContent={
        <>
          <div className={classes.info}>
            <span className={Icons.ICON_INFO}></span>
            <div className={classes.infoText}>
              Select a task and all subsequent tasks will repair automatically.
              You can also choose to repair from anywhere else!
            </div>
          </div>
          <div
            style={{width: '80vw', height: '80vh'}}
            className={classes.container}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodeClick={() => {}}
              fitView
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>
        </>
      }
      dialogFooter={{
        primaryButton: {
          text: 'Repair Selected Tasks',
          onClick: onRepairRun,
          isLoading: repairWorkflowRunData?.status === API_STATUS.LOADING,
          disabled: selectedTasks.length === 0
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: handleClose
        }
      }}
    />
  )
}

const mapStateToProps = (state: CommonState) => ({
  repairWorkflowRunData: state.workflowDetailsReducer.repairRun
})

const mapDispatchToProps = (dispatch) => {
  return {
    repairWorkflowRun: (payload: RepairWorkflowRunInput) =>
      repairWorkflowRun(dispatch, payload),
    resetRepairWorkflowRun: () => dispatch(resetRepairWorkflowRun())
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(RepairRun)

export default StyleComponent
