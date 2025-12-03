import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node
} from 'reactflow'
import {compose} from 'redux'

import 'reactflow/dist/style.css'
import {getInitialEdges, getInitialNodes} from './nodes'

import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {SelectionOnTasks} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {GetWorkflowPathIdsInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowPathIds'
import {getWorkflowPathIds} from '../../../modules/workflows/graphqlAPIs/getWorkflowPathIds/index.thunk'
import {GetWorkflowRunDetailsInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowRunDetails'
import {getWorkflowRunDetails} from '../../../modules/workflows/graphqlAPIs/getWorkflowRunDetails/index.thunk'
import {GetWorkflowTaskDetailsInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowTaskDetails'
import {getWorkflowTaskDetails} from '../../../modules/workflows/graphqlAPIs/getWorkflowTaskDetails/index.thunk'
import {GetWorkflowTaskDetailsWithoutRunInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowTaskDetailsWithoutRun'
import {getWorkflowTaskDetailsWithoutRun} from '../../../modules/workflows/graphqlAPIs/getWorkflowTaskDetailsWithoutRun/index.thunk'
import {RepairWorkflowRunInput} from '../../../modules/workflows/graphqlAPIs/repairWorkflowRun'
import {repairWorkflowRun} from '../../../modules/workflows/graphqlAPIs/repairWorkflowRun/index.thunk'
import {SIDE_PANELS} from '../../../modules/workflows/pages/workflowDetails/constants'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import RepairRun from '../repairRun'
import TaskOutputDrawer from '../taskOutputDrawer'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  activeTab?: string
  getWorkflowTaskDetails: (payload: GetWorkflowTaskDetailsInput) => void
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
  workflowPathIds: IWorkflowsDetailsState['workflowPathIds']
  getWorkflowTaskDetailsWithoutRun: (
    payload: GetWorkflowTaskDetailsWithoutRunInput
  ) => void
  setSidePanel: (payload: string) => void
  taskIdOfRun: string
  taskIdWithoutRun: string
  openRepairRun: boolean
  setOpenRepairRun: React.Dispatch<React.SetStateAction<boolean>>
  getWorkflowRunDetailsFunc: (payload: GetWorkflowRunDetailsInput) => void
  getworkflowPathIdsFunc: (variables: GetWorkflowPathIdsInput) => void
}

const WorkflowTasks = (props: IProps) => {
  const {
    classes,
    activeTab,
    getWorkflowTaskDetails,
    workflowDetails,
    workflowRunDetails,
    workflowPathIds,
    getWorkflowTaskDetailsWithoutRun,
    setSidePanel,
    taskIdOfRun,
    taskIdWithoutRun,
    openRepairRun,
    setOpenRepairRun,
    getWorkflowRunDetailsFunc,
    getworkflowPathIdsFunc
  } = props
  const history = useHistory()
  const [nodes, setNodes] = useState(
    getInitialNodes(
      classes,
      (activeTab !== 'Tasks' ? workflowRunDetails : workflowDetails)?.data
        ?.tasks || [],
      activeTab !== 'Tasks'
    )
  )

  const [edges, setEdges] = useState(
    getInitialEdges(
      (activeTab !== 'Tasks' ? workflowRunDetails : workflowDetails)?.data
        ?.tasks || []
    )
  )
  const [selectedNode, setSelectedNode] =
    useState<Node<SelectionOnTasks> | null>(null)

  useEffect(() => {
    if (
      taskIdOfRun &&
      workflowRunDetails?.data &&
      workflowDetails?.data &&
      nodes
    ) {
      getWorkflowTaskDetails({
        workflowId: workflowRunDetails?.data?.workflow_id,
        runId: workflowRunDetails?.data?.run_id,
        taskId: taskIdOfRun
      })
      setSelectedNode(nodes.find((node) => node.data.task_name === taskIdOfRun))
    }
  }, [taskIdOfRun, workflowRunDetails, workflowDetails, nodes])

  useEffect(() => {
    if (workflowDetails?.data?.tasks && activeTab === 'Tasks') {
      setNodes(
        getInitialNodes(
          classes,
          (activeTab !== 'Tasks' ? workflowRunDetails : workflowDetails)?.data
            ?.tasks || [],
          activeTab !== 'Tasks'
        )
      )
      setEdges(
        getInitialEdges(
          (activeTab !== 'Tasks' ? workflowRunDetails : workflowDetails)?.data
            ?.tasks || []
        )
      )
    }
  }, [workflowDetails, activeTab])

  useEffect(() => {
    if (taskIdWithoutRun && workflowDetails && workflowDetails?.data && nodes) {
      getWorkflowTaskDetailsWithoutRun({
        workflowId: workflowDetails?.data?.workflow_id,
        taskId: taskIdWithoutRun
      })
      setNodes(
        getInitialNodes(
          classes,
          workflowDetails?.data?.tasks || [],
          activeTab !== 'Tasks',
          taskIdWithoutRun
        )
      )
      setEdges(getInitialEdges(workflowDetails?.data?.tasks || []))
      setSidePanel(SIDE_PANELS.workflowTaskDetails)
    }
  }, [taskIdWithoutRun, workflowDetails])

  const onNodeClick = (event, node: Node<SelectionOnTasks>) => {
    if (activeTab === 'Tasks') {
      const link = encodeURI(
        `/workflows/${workflowDetails?.data?.workflow_id}/tasks/${node.data.task_name}`
      )
      history.replace(link)
    } else {
      const link = encodeURI(
        `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${node.data.task_name}/latest/application-logs`
      )
      history.replace(link)
    }
  }

  const onDrawerClose = () => {
    const link = encodeURI(
      `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks`
    )
    history.replace(link)
    setSelectedNode(null)
  }

  const onRepairRunSuccess = () => {
    setOpenRepairRun(false)
    getWorkflowRunDetailsFunc({
      workflowId: workflowRunDetails?.data?.workflow_id,
      runId: workflowRunDetails?.data?.run_id
    })
  }

  useEffect(() => {
    return () => {
      setSidePanel(SIDE_PANELS.workflowDetails)
    }
  }, [])

  return (
    <div className={classes.container} data-testid='workflow-details-tasks-tab'>
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView>
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      {activeTab !== 'Tasks' && (
        <TaskOutputDrawer
          selectedTask={selectedNode?.data}
          closeDrawer={onDrawerClose}
        />
      )}
      {activeTab !== 'tasks' && (
        <RepairRun
          open={openRepairRun}
          handleClose={() => setOpenRepairRun(false)}
          workflowRunDetails={workflowRunDetails}
          onRepairRunSuccess={onRepairRunSuccess}
        />
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflowDetails: state.workflowDetailsReducer.workflowDetails,
  workflowRunDetails: state.workflowDetailsReducer.workflowRunDetails,
  workflowPathIds: state.workflowDetailsReducer.workflowPathIds
})

const mapDispatchToProps = (dispatch) => {
  return {
    getWorkflowTaskDetails: (payload: GetWorkflowTaskDetailsInput) =>
      getWorkflowTaskDetails(dispatch, payload),
    getWorkflowTaskDetailsWithoutRun: (
      payload: GetWorkflowTaskDetailsWithoutRunInput
    ) => getWorkflowTaskDetailsWithoutRun(dispatch, payload),
    repairWorkflowRun: (payload: RepairWorkflowRunInput) =>
      repairWorkflowRun(dispatch, payload),
    getWorkflowRunDetailsFunc: (payload: GetWorkflowRunDetailsInput) =>
      getWorkflowRunDetails(dispatch, payload),
    getworkflowPathIdsFunc: (variables) =>
      getWorkflowPathIds(dispatch, variables)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowTasks)

export default StyleComponent
