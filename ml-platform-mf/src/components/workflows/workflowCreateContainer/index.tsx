import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'

import {
  Control,
  FieldError,
  FormState,
  UseFormGetFieldState,
  UseFormSetValue,
  UseFormTrigger,
  useWatch
} from 'react-hook-form'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  ReactFlowInstance
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import {
  IWorkflowCreateForm,
  IWorkflowTaskForm
} from '../../../modules/workflows/types/common.types'
import {API_STATUS} from '../../../utils/apiUtils'
import ClusterListDrawer from '../clusterListDrawer'
import CustomNode from '../customNode'
import JobClusterCreateDrawer from '../jobClusterCreateDrawer'
import JobClusterDetailsDrawer from '../jobClusterDetailsDrawer'
import WorkflowCreateDrawer from '../workflowCreateDrawer'
import WorkflowTaskContainer from '../workflowTaskContainer'
import WorkflowUpdateDrawer from '../workflowUpdateDrawer'
import styles from './indexJSS'
import {getInitialEdges, getInitialNodes} from './nodes'

interface IProps extends WithStyles<typeof styles> {
  sidepanel: ISidepanel
  onNewNodeCreate: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  control: Control<IWorkflowCreateForm, any>
  selectedTaskId: string
  taskIdx: number
  setValue: UseFormSetValue<IWorkflowCreateForm>
  onTaskAdd: () => void
  onCreateTask: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onDeleteTask: (task: IWorkflowTaskForm) => void
  onCloseTaskDrawer: () => void
  onNodeClicked: (node: IWorkflowTaskForm) => void
  onCloseWorkflowCreateDrawer: () => void
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  onWorkflowCreate: (
    e?: React.BaseSyntheticEvent<object, any, any>
  ) => Promise<void>
  taskFieldState: {
    invalid: boolean
    isDirty: boolean
    isTouched: boolean
    error?: FieldError
  }
  formState: FormState<IWorkflowCreateForm>
  editMode?: boolean
  trigger: UseFormTrigger<IWorkflowCreateForm>
  workflowAPIStatus: API_STATUS
}

const WorkflowCreateContainer = (props: IProps) => {
  const {
    classes,
    sidepanel,
    onNewNodeCreate,
    control,
    selectedTaskId,
    taskIdx,
    setValue,
    onTaskAdd,
    onCreateTask,
    onDeleteTask,
    onCloseTaskDrawer,
    onNodeClicked,
    onCloseWorkflowCreateDrawer,
    setSidepanel,
    onWorkflowCreate,
    taskFieldState,
    formState,
    editMode,
    trigger,
    workflowAPIStatus
  } = props
  const [reactflowInstance, setReactflowInstance] =
    useState<ReactFlowInstance<Node, Edge>>(null)
  const tasks = useWatch({
    control,
    name: 'tasks'
  })

  const [nodes, setNodes] = useState(
    getInitialNodes(
      classes,
      tasks,
      false,
      selectedTaskId,
      onDeleteTask,
      onCreateTask,
      taskFieldState,
      editMode,
      formState
    )
  )
  const [edges, setEdges] = useState(getInitialEdges(tasks))

  useEffect(() => {
    setNodes(
      getInitialNodes(
        classes,
        tasks,
        false,
        selectedTaskId,
        onDeleteTask,
        onCreateTask,
        taskFieldState,
        editMode,
        formState
      )
    )
    setEdges(getInitialEdges(tasks))

    setTimeout(() => {
      reactflowInstance?.fitView()
    }, 0)
  }, [tasks, selectedTaskId, taskFieldState, formState])

  const nodeTypes = useMemo(() => ({customNode: CustomNode}), [])

  const mainContentFlexAmount = (() => {
    switch (sidepanel.type) {
      case SIDEPANEL_TYPES.TASK:
        return '1'
      case SIDEPANEL_TYPES.WORKFLOW:
        return '1'
      case SIDEPANEL_TYPES.CLUSTER:
        return '1'
      case SIDEPANEL_TYPES.JOB_CLUSTER_CREATE:
        return '0 0 5%'
      case SIDEPANEL_TYPES.JOB_CLUSTER_DETAILS:
        return '0 0 5%'
      default:
        return '1'
    }
  })()

  const secondaryContentFlexAmount = (() => {
    switch (sidepanel.type) {
      case SIDEPANEL_TYPES.TASK:
        return '0 0 360px'
      case SIDEPANEL_TYPES.WORKFLOW:
        return '0 0 360px'
      case SIDEPANEL_TYPES.CLUSTER:
        return '0 0 360px'
      case SIDEPANEL_TYPES.JOB_CLUSTER_CREATE:
        return '1'
      case SIDEPANEL_TYPES.JOB_CLUSTER_DETAILS:
        return '1'
      default:
        return '0 0 360px'
    }
  })()

  const onInit = (instance: ReactFlowInstance<Node, Edge>) => {
    setReactflowInstance(instance)
  }

  return (
    <div className={classes.container}>
      <div
        className={classes.mainContent}
        style={{flex: sidepanel.open ? mainContentFlexAmount : '1'}}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(event, node: Node<IWorkflowTaskForm>) =>
            onNodeClicked(node.data)
          }
          fitView
          nodeTypes={nodeTypes}
          onInit={onInit}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
      {sidepanel.open && (
        <div
          className={classes.sidepanel}
          style={{flex: secondaryContentFlexAmount}}
        >
          {sidepanel.type === SIDEPANEL_TYPES.TASK && taskIdx !== null && (
            <WorkflowTaskContainer
              control={control}
              taskIdx={taskIdx}
              setValue={setValue}
              onTaskAdd={onTaskAdd}
              onCloseTaskDrawer={onCloseTaskDrawer}
              setSidepanel={setSidepanel}
              editMode={editMode}
              trigger={trigger}
              formState={formState}
            />
          )}
          {sidepanel.type === SIDEPANEL_TYPES.WORKFLOW && (
            <WorkflowCreateDrawer
              control={control}
              onCloseWorkflowCreateDrawer={onCloseWorkflowCreateDrawer}
              onWorkflowCreate={onWorkflowCreate}
              formState={formState}
              editMode={editMode}
              workflowAPIStatus={workflowAPIStatus}
              setValue={setValue}
            />
          )}
          {sidepanel.type === SIDEPANEL_TYPES.UPDATE && (
            <WorkflowUpdateDrawer
              control={control}
              onCloseWorkflowCreateDrawer={onCloseWorkflowCreateDrawer}
              onWorkflowCreate={onWorkflowCreate}
              formState={formState}
              editMode={editMode}
              setValue={setValue}
            />
          )}
          {sidepanel.type === SIDEPANEL_TYPES.CLUSTER && (
            <ClusterListDrawer
              setSidepanel={setSidepanel}
              control={control}
              taskIdx={taskIdx}
              setValue={setValue}
              trigger={trigger}
            />
          )}
          {sidepanel.type === SIDEPANEL_TYPES.JOB_CLUSTER_CREATE && (
            <JobClusterCreateDrawer
              setSidepanel={setSidepanel}
              clusterDefinitionId={sidepanel.data}
            />
          )}
          {sidepanel.type === SIDEPANEL_TYPES.JOB_CLUSTER_DETAILS &&
            sidepanel.data && (
              <JobClusterDetailsDrawer
                clusterDefnitionId={sidepanel.data}
                setSidepanel={setSidepanel}
              />
            )}
        </div>
      )}
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowCreateContainer
)

export default StyleComponent
