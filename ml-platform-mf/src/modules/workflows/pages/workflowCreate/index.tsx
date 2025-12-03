import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useRef, useState} from 'react'

import {yupResolver} from '@hookform/resolvers/yup'
import {FormProvider, useFieldArray, useForm, useWatch} from 'react-hook-form'
import {connect, useDispatch} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import ShortcutDialog from '../../../../components/workflows/shortcutDialog'
import ShortcutsSnacksbarContainer from '../../../../components/workflows/shortcutsSnacksbarContainer'
import WorkflowCreateContainer from '../../../../components/workflows/workflowCreateContainer'
import WorkflowCreateHeader from '../../../../components/workflows/workflowCreateHeader'
import {routes} from '../../../../constants'
import {usePreventNavigation} from '../../../../hooks'
import {CommonState} from '../../../../reducers/commonReducer'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {API_STATUS} from '../../../../utils/apiUtils'
import {logEvent} from '../../../../utils/events'
import {
  getDefaultTask,
  getDefaultWorkflowParameters,
  sourceTypes,
  workflowFormSchema
} from '../../constants'
import {CreateWorkflowInput} from '../../graphqlAPIs/createWorkflow'
import {createWorkflow} from '../../graphqlAPIs/createWorkflow/index.thunk'
import {GetWorkflowsMetaDataInput} from '../../graphqlAPIs/getWorkflowsMetaData'
import {getWorkflowsMetaData} from '../../graphqlAPIs/getWorkflowsMetaData/index.thunk'
import {IWorkflowCreateForm, IWorkflowTaskForm} from '../../types/common.types'
import {
  getFilePath,
  getInputParamters,
  getScheduleString,
  getSourcePath,
  getWorkflowParameters
} from '../../utils'
import {
  resetCreateWorkflow,
  resetWorkflowAllPurposeClusters,
  resetWorkflowAttachedClusters,
  resetWorkflowHighlightedCluster,
  resetWorkflowJobCluster
} from './actions'
import styles from './indexJSS'
import {IWorkflowCreateState} from './reducer'

export const SIDEPANEL_TYPES = {
  TASK: 'task',
  WORKFLOW: 'workflow',
  UPDATE: 'workflow_update',
  CLUSTER: 'cluster',
  PATH_SELECTION: 'path_selection',
  JOB_CLUSTER_CREATE: 'job_cluster_create',
  JOB_CLUSTER_DETAILS: 'job_cluster_details'
}

export interface ISidepanel {
  open: boolean
  type: string
  data: any
}

interface IProps extends WithStyles<typeof styles> {
  workflowCreate: IWorkflowCreateState['workflowCreate']
  checkUniqueWorkflow: IWorkflowCreateState['checkUniqueWorkflow']
  createWorkflow: (payload: CreateWorkflowInput) => void
  resetCreateWorkflow: () => void
  getWorkflowsMetaData: (payload: GetWorkflowsMetaDataInput) => void
}

const WorkflowCreate = (props: IProps) => {
  const {
    classes,
    workflowCreate,
    checkUniqueWorkflow,
    createWorkflow,
    resetCreateWorkflow,
    getWorkflowsMetaData
  } = props
  const history = useHistory()
  const [sidepanel, setSidepanel] = useState<ISidepanel>({
    open: true,
    type: SIDEPANEL_TYPES.TASK,
    data: null
  })
  const [openShortcutDialog, setOpenShortcutDialog] = useState(false)

  const methods = useForm<IWorkflowCreateForm>({
    resolver: yupResolver(workflowFormSchema),
    defaultValues: {
      tasks: [getDefaultTask()],
      name: 'untitled_workflow',
      displayName: 'untitled_workflow',
      isWorkflowNameUnique: true,
      maxConcurrentRuns: 1,
      numberOfRetries: 1,
      parameters: [getDefaultWorkflowParameters()],
      enableHA: false,
      notifications: null,
      queueEnabled: true,
      notification_preference: {
        on_fail: true,
        on_skip: false,
        on_start: false,
        on_success: false
      }
    },
    mode: 'onTouched'
  })

  const {control, setValue, handleSubmit, trigger, getFieldState, formState} =
    methods

  const {append: taskApend, remove: taskRemove} = useFieldArray({
    name: 'tasks',
    control
  })

  const tasks = useWatch({
    control,
    name: 'tasks'
  })
  const [selectedTask, setSelectedTask] = useState(tasks[0].id)
  const taskFieldState = getFieldState('tasks')
  const {bypassGuard} = usePreventNavigation(
    'Are you sure?',
    'Are you sure you want to exit ? You will lose all unsaved changes.'
  )

  const onCloseTaskDrawer = () => {
    trigger('tasks').then(() => {
      setSidepanel({
        open: false,
        type: null,
        data: null
      })
      setSelectedTask(null)
    })
  }

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(resetWorkflowJobCluster('current'))
    dispatch(resetWorkflowJobCluster('other'))
    dispatch(resetWorkflowAllPurposeClusters('other'))
    dispatch(resetWorkflowAllPurposeClusters('current'))
    dispatch(resetWorkflowAttachedClusters())
    dispatch(resetWorkflowHighlightedCluster())
  }, [])

  const onNodeClicked = (node: IWorkflowTaskForm) => {
    setSidepanel({
      open: true,
      type: SIDEPANEL_TYPES.TASK,
      data: null
    })
    setSelectedTask(node.id)
  }

  const onNewNodeCreate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    const defaultTask = getDefaultTask()
    taskApend({...defaultTask})
  }

  const getTaskIndex = (selectedTaskId: string) => {
    if (!selectedTaskId) return null
    const foundTask = tasks.findIndex((task) => task.id === selectedTaskId)
    return foundTask !== -1 ? foundTask : null
  }

  const onTaskAdd = () => {
    trigger('tasks').then(() => {
      const field = getFieldState('tasks')
      if (!field.error) {
        onCloseTaskDrawer()
      }
    })
  }

  const onSubmit = () => {
    setSelectedTask(null)
    setSidepanel({
      open: true,
      type: SIDEPANEL_TYPES.WORKFLOW,
      data: null
    })
  }

  const onCloseWorkflowCreateDrawer = () => {
    setSidepanel({
      open: false,
      type: null,
      data: null
    })
  }

  const onCreateTask = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | KeyboardEvent
  ) => {
    e.stopPropagation()
    const defaultTask = getDefaultTask()
    taskApend({...defaultTask})
    setSelectedTask(defaultTask.id)
    setSidepanel({
      open: true,
      type: SIDEPANEL_TYPES.TASK,
      data: null
    })
  }

  const onDeleteTask = (task: IWorkflowTaskForm) => {
    if (task.id === selectedTask) {
      onCloseTaskDrawer()
    }
    const updatedTasks = tasks
    updatedTasks.forEach((task, index) => {
      const newDependsOn = task.dependentOn.filter((d) => d !== task.id)
      task.dependentOn = newDependsOn
    })
    updatedTasks.splice(getTaskIndex(task.id), 1)
    setValue('tasks', updatedTasks, {shouldDirty: true})
    // taskRemove(getTaskIndex(task.id))
  }

  const onWorkflowCreate = handleSubmit((data) => {
    const workflowInputTasks = data.tasks.map((task) => {
      const clusterType: 'job' | 'basic' =
        task.cluster.type === 'job' ? 'job' : 'basic'
      return {
        taskName: task.name,
        timeout: task.timeout,
        sourceType: task.source,
        source: getSourcePath(task),
        filePath: getFilePath(task),
        retries: task.retries,
        inputParameters: getInputParamters(task),
        dynamicArtifact: (task.dynamicCode as unknown as string) === 'true',
        dependsOn: task.dependentOn.map(
          (d) => tasks.find((t) => t.id === d)?.name
        ),
        dependentLibraries: task.dependentLibraries,
        packages: task.packages || [],
        clusterType: clusterType,
        clusterId: task.cluster.id,
        ha_config: {
          enable_ha: data.enableHA === undefined ? false : data.enableHA
        },
        notify_on: task?.notify_on,
        notification_preference: task?.notification_preference,
        trigger_rule:
          task?.dependentOn?.length === 0 ? null : task?.trigger_rule?.value
      }
    })
    const workflowInput: CreateWorkflowInput = {
      input: {
        workflowName: data.displayName,
        displayName: data.displayName,
        description: data.description,
        tags: data.tags || [],
        maxConcurrentRuns: data.maxConcurrentRuns,
        parameters: getWorkflowParameters(data.parameters),
        expected_run_duration: data.notifications,
        notification_preference: data.notification_preference,
        queue_enabled: data.queueEnabled,
        schedule: getScheduleString(data),
        retries: data.numberOfRetries,
        notifyOn: data.slackChannel || '',
        tasks: workflowInputTasks
      }
    }

    createWorkflow(workflowInput)
  })

  useEffect(() => {
    logEvent(EventTypes.WORKFLOWS.CREATE_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
    if (workflowCreate?.status === API_STATUS.SUCCESS) {
      resetCreateWorkflow()
      bypassGuard(routes.workflows)
      // history.replace(routes.workflows)
    }
  }, [workflowCreate])

  useEffect(() => {
    const metaDataPayload: GetWorkflowsMetaDataInput = {
      names: ['trigger_rules']
    }

    getWorkflowsMetaData(metaDataPayload)
  }, [])

  useEffect(() => {
    if (checkUniqueWorkflow?.status === API_STATUS.SUCCESS) {
      setValue('isWorkflowNameUnique', checkUniqueWorkflow?.data?.unique)
    } else {
      setValue('isWorkflowNameUnique', true)
    }
    trigger('name')
  }, [checkUniqueWorkflow])

  const onKeyDownHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'N' && ev.shiftKey) {
      if (
        !selectedTask &&
        taskFieldState.isTouched &&
        !taskFieldState.error &&
        !sidepanel.open
      ) {
        onCreateTask(ev)
      }
    } else if (ev.key === 'Backspace' && ev.shiftKey && tasks.length > 1) {
      if (selectedTask) {
        onDeleteTask(tasks[getTaskIndex(selectedTask)])
      }
    } else if (ev.key === 'S' && ev.shiftKey) {
      if (
        !selectedTask &&
        !taskFieldState.error &&
        taskFieldState.isTouched &&
        !sidepanel.open
      ) {
        onSubmit()
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownHandler)

    return () => {
      document.removeEventListener('keydown', onKeyDownHandler)
    }
  }, [selectedTask, taskFieldState.error, sidepanel.open, tasks])

  const headerRef = useRef<HTMLDivElement>(null)

  return (
    <FormProvider {...methods}>
      <div className={classes.container}>
        <ShortcutDialog
          open={openShortcutDialog}
          handleClose={() => setOpenShortcutDialog(false)}
        />
        <WorkflowCreateHeader
          control={control}
          onSubmit={onSubmit}
          selectedTaskId={selectedTask}
          taskFieldState={taskFieldState}
          ref={headerRef}
        />
        <WorkflowCreateContainer
          sidepanel={sidepanel}
          onNewNodeCreate={onNewNodeCreate}
          control={control}
          selectedTaskId={selectedTask}
          taskIdx={getTaskIndex(selectedTask)}
          setValue={setValue}
          onTaskAdd={onTaskAdd}
          onCreateTask={onCreateTask}
          onDeleteTask={onDeleteTask}
          onCloseTaskDrawer={onCloseTaskDrawer}
          onNodeClicked={onNodeClicked}
          onCloseWorkflowCreateDrawer={onCloseWorkflowCreateDrawer}
          setSidepanel={setSidepanel}
          onWorkflowCreate={onWorkflowCreate}
          taskFieldState={taskFieldState}
          formState={formState}
          trigger={trigger}
          workflowAPIStatus={workflowCreate.status}
        />
        <ShortcutsSnacksbarContainer
          openSnackbar={
            !selectedTask &&
            !taskFieldState.error &&
            taskFieldState.isTouched &&
            !sidepanel.open
          }
          onBtnClicked={() => setOpenShortcutDialog(true)}
        />
      </div>
    </FormProvider>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflowCreate: state.workflowCreateReducer.workflowCreate,
  checkUniqueWorkflow: state.workflowCreateReducer.checkUniqueWorkflow
})

const mapDispatchToProps = (dispatch) => {
  return {
    createWorkflow: (payload: CreateWorkflowInput) =>
      createWorkflow(dispatch, payload),
    resetCreateWorkflow: () => dispatch(resetCreateWorkflow()),
    getWorkflowsMetaData: (payload: GetWorkflowsMetaDataInput) => {
      getWorkflowsMetaData(dispatch, payload)
    }
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowCreate)

export default StyleComponent
