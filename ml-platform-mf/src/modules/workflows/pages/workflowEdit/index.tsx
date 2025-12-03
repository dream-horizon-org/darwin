import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {CommonState} from '../../../../reducers/commonReducer'

import {yupResolver} from '@hookform/resolvers/yup'
import {FormProvider, useFieldArray, useForm, useWatch} from 'react-hook-form'
import {useHistory} from 'react-router'
import {setShowGlobalSpinner} from '../../../../actions/commonActions'
import {ClusterCardProps} from '../../../../components/workflows/clusterCard'
import ShortcutDialog from '../../../../components/workflows/shortcutDialog'
import ShortcutsSnacksbarContainer from '../../../../components/workflows/shortcutsSnacksbarContainer'
import WorkflowCreateContainer from '../../../../components/workflows/workflowCreateContainer'
import WorkflowCreateHeader from '../../../../components/workflows/workflowCreateHeader'
import {routes} from '../../../../constants'
import {usePreventNavigation} from '../../../../hooks'
import {NavigationMode} from '../../../../hooks/src/usePreventNavigation/usePreventNavigation.hook'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {API_STATUS} from '../../../../utils/apiUtils'
import {logEvent} from '../../../../utils/events'
import {
  getDefaultTask,
  getDefaultWorkflowParameters,
  workflowFormSchema
} from '../../constants'
import {GetWorkflowDetailsInput} from '../../graphqlAPIs/getWorkflowDetails'
import {getWorkflowDetails} from '../../graphqlAPIs/getWorkflowDetails/index.thunk'
import {GetWorkflowsMetaDataInput} from '../../graphqlAPIs/getWorkflowsMetaData'
import {getWorkflowsMetaData} from '../../graphqlAPIs/getWorkflowsMetaData/index.thunk'
import {UpdateWorkflowInput} from '../../graphqlAPIs/updateWorkflow'
import {updateWorkflow} from '../../graphqlAPIs/updateWorkflow/index.thunk'
import {IWorkflowCreateForm, IWorkflowTaskForm} from '../../types/common.types'
import {
  getFilePath,
  getInputParamters,
  getParsedTasks,
  getParsedWorkflowParameters,
  getScheduleString,
  getSourcePath,
  getWorkflowParameters,
  parseCronString
} from '../../utils'
import {ISidepanel, SIDEPANEL_TYPES} from '../workflowCreate'
import {
  setWorkflowJobClusters,
  setWorkkflowAttachedCluster
} from '../workflowCreate/actions'
import {IWorkflowCreateState} from '../workflowCreate/reducer'
import {IWorkflowsDetailsState} from '../workflowDetails/reducer'
import {resetUpdateWorkflow} from './actions'
import styles from './indexJSS'
import {IWorkflowEditState} from './reducer'
interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  updateWorkflowData: IWorkflowEditState['updateWorkflow']
  getWorkflowDetails: (payload: GetWorkflowDetailsInput) => void
  setShowGlobalSpinner: (payload: boolean) => void
  updateWorkflow: (payload: UpdateWorkflowInput) => void
  resetUpdateWorkflow: () => void
  checkUniqueWorkflowData: IWorkflowCreateState['checkUniqueWorkflow']
  getWorkflowsMetaData: (payload: GetWorkflowsMetaDataInput) => void
}

const WorkflowEdit = (props: IProps) => {
  const {
    classes,
    getWorkflowDetails,
    updateWorkflowData,
    workflowDetails,
    setShowGlobalSpinner,
    updateWorkflow,
    resetUpdateWorkflow,
    checkUniqueWorkflowData,
    getWorkflowsMetaData
  } = props
  const history = useHistory()
  const [sidepanel, setSidepanel] = useState<ISidepanel>({
    open: true,
    type: SIDEPANEL_TYPES.UPDATE,
    data: null
  })
  const [openShortcutDialog, setOpenShortcutDialog] = useState(false)
  const methods = useForm<IWorkflowCreateForm>({
    resolver: yupResolver(workflowFormSchema),
    defaultValues: {
      tasks: [getDefaultTask()],
      name: 'Untitled workflow',
      displayName: 'Untitled workflow',
      enableHA: false,
      notifications: null,
      parameters: [getDefaultWorkflowParameters()],
      queueEnabled: true,
      notification_preference: {
        on_fail: true,
        on_start: false,
        on_success: false,
        on_skip: false
      }
    }
  })

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState,
    getFieldState,
    trigger,
    getValues
  } = methods

  const {bypassGuard} = usePreventNavigation(
    'Are you sure?',
    'Are you sure you want to exit ? You will lose all unsaved changes.',
    NavigationMode.BACK
  )

  const {append: taskApend, remove: taskRemove} = useFieldArray({
    name: 'tasks',
    control
  })

  const tasks = useWatch({
    control,
    name: 'tasks'
  })
  const displayName = useWatch({
    control,
    name: 'displayName'
  })
  const [selectedTask, setSelectedTask] = useState(null)
  const taskFieldState = getFieldState('tasks')

  const dispatch = useDispatch()
  const [workflowId, setWorkflowId] = useState(
    history.location.pathname.split('/')[2]
  )

  useEffect(() => {
    logEvent(EventTypes.WORKFLOWS.EDIT_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
    const payload = {
      workflowId: workflowId
    }
    getWorkflowDetails(payload)

    const metaDataPayload: GetWorkflowsMetaDataInput = {
      names: ['trigger_rules']
    }

    getWorkflowsMetaData(metaDataPayload)
  }, [workflowId])

  useEffect(() => {
    if (updateWorkflowData.status === API_STATUS.SUCCESS) {
      resetUpdateWorkflow()
      bypassGuard(`${routes.workflows}/${workflowId}/runs`)
    }
  }, [updateWorkflowData])

  useEffect(() => {
    if (workflowDetails?.status === API_STATUS.LOADING) {
      setShowGlobalSpinner(true)
    }

    if (workflowDetails?.status === API_STATUS.SUCCESS) {
      let schedule = null
      if (workflowDetails?.data?.schedule) {
        schedule = parseCronString(workflowDetails?.data?.schedule)
      }

      const parsedTasks = getParsedTasks(workflowDetails?.data?.tasks)
      const newTasks = parsedTasks.map((task) => {
        return {
          ...task,
          dependentOn: task.dependentOn.map(
            (d) => parsedTasks.find((t) => t.name === d)?.id
          )
        }
      })

      const jobClusters: ClusterCardProps[] = workflowDetails?.data?.tasks
        ?.filter((task) => {
          return task.attached_cluster.cluster_id.startsWith('job', 0)
        })
        .filter(
          (task, index, tasks) =>
            tasks.findIndex(
              (t) =>
                t.attached_cluster.cluster_id ===
                task.attached_cluster.cluster_id
            ) === index
        )
        .map((task) => {
          const cluster = task.attached_cluster
          return {
            id: cluster.cluster_id,
            type: 'job',
            runtime: cluster.runtime,
            name: cluster.cluster_name,
            estimatedCost: cluster.estimated_cost,
            memory: cluster.memory,
            core: cluster.cores,
            createdAt: cluster.created_at,
            status: cluster.cluster_status
          }
        })

      dispatch(
        setWorkflowJobClusters(jobClusters, 'current', jobClusters.length)
      )

      workflowDetails?.data?.tasks.forEach((task, index) => {
        const cluster = task.attached_cluster
        dispatch(
          setWorkkflowAttachedCluster(index, {
            id: cluster.cluster_id,
            type: cluster.cluster_id.startsWith('job', 0)
              ? 'job'
              : 'all_purpose',
            runtime: cluster.runtime,
            name: cluster.cluster_name,
            estimatedCost: cluster.estimated_cost,
            memory: cluster.memory,
            core: cluster.cores,
            createdAt: cluster.created_at,
            status: cluster.cluster_status
          })
        )
      })

      reset({
        tasks: newTasks,
        isWorkflowNameUnique: true,
        tags: workflowDetails?.data?.tags,
        schedule: schedule
          ? {
              minutes: schedule.minute,
              hours: schedule.hour,
              dayOfMonth: schedule.day,
              month: schedule.month,
              dayOfWeek: schedule.week,
              isOnce: schedule.isOnce
            }
          : null,
        maxConcurrentRuns: workflowDetails?.data?.max_concurrent_runs,
        parameters: getParsedWorkflowParameters(
          workflowDetails?.data?.parameters || []
        ),
        queueEnabled: workflowDetails?.data?.queue_enabled,
        notification_preference: workflowDetails?.data?.notification_preference,
        notifications: workflowDetails?.data?.expected_run_duration,
        numberOfRetries: workflowDetails?.data?.retries,
        slackChannel: workflowDetails?.data?.notify_on,
        name: workflowDetails?.data?.workflow_name,
        displayName: workflowDetails?.data?.display_name,
        description: workflowDetails?.data?.description,
        enableHA: !workflowDetails?.data?.tasks[0]?.ha_config
          ? false
          : workflowDetails?.data?.tasks[0]?.ha_config?.enable_ha
      })
      // setSelectedTask(parsedTasks[0].id)

      setShowGlobalSpinner(false)
    }
  }, [workflowDetails?.status])

  const onCloseTaskDrawer = () => {
    trigger('tasks').then(() => {
      setSidepanel({
        open: true,
        type: SIDEPANEL_TYPES.UPDATE,
        data: null
      })
      setSelectedTask(null)
    })
  }

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
      type: SIDEPANEL_TYPES.UPDATE,
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
        trigger_rule:
          task?.dependentOn?.length === 0 ? null : task?.trigger_rule?.value,
        notification_preference: task?.notification_preference
      }
    })
    const workflowInput: UpdateWorkflowInput = {
      workflowId: workflowDetails?.data?.workflow_id,
      input: {
        workflowName: data.name,
        displayName: data.displayName,
        description: data.description,
        tags: data.tags,
        maxConcurrentRuns: data.maxConcurrentRuns,
        parameters: getWorkflowParameters(data.parameters),
        expected_run_duration: data.notifications,
        queue_enabled: data.queueEnabled,
        notification_preference: data.notification_preference,
        schedule: getScheduleString(data),
        retries: data.numberOfRetries,
        notifyOn: data.slackChannel,
        tasks: workflowInputTasks,
        createdBy: workflowDetails?.data?.created_by
      }
    }

    updateWorkflow(workflowInput)
  })

  useEffect(() => {
    if (
      checkUniqueWorkflowData?.status === API_STATUS.SUCCESS &&
      checkUniqueWorkflowData?.data?.unique
    ) {
      setValue('isWorkflowNameUnique', true)
    } else if (displayName === workflowDetails?.data?.display_name) {
      setValue('isWorkflowNameUnique', true)
    } else {
      setValue('isWorkflowNameUnique', false)
    }

    trigger('displayName')
  }, [checkUniqueWorkflowData, workflowDetails, displayName])

  const onKeyDownHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'N' && ev.shiftKey) {
      if (
        !selectedTask &&
        !taskFieldState.error &&
        (!sidepanel.open || sidepanel.type === SIDEPANEL_TYPES.UPDATE)
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
        (!sidepanel.open || sidepanel.type === SIDEPANEL_TYPES.UPDATE)
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
          onWorkflowCreate={onWorkflowCreate}
          selectedTaskId={selectedTask}
          taskFieldState={taskFieldState}
          formState={formState}
          editMode={true}
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
          editMode={true}
          trigger={trigger}
          workflowAPIStatus={updateWorkflowData.status}
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
  workflowDetails: state.workflowDetailsReducer.workflowDetails,
  updateWorkflowData: state.workflowEditReducer.updateWorkflow,
  checkUniqueWorkflowData: state.workflowCreateReducer.checkUniqueWorkflow
})

const mapDispatchToProps = (dispatch) => {
  return {
    getWorkflowDetails: (payload: GetWorkflowDetailsInput) =>
      getWorkflowDetails(dispatch, payload),
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload)),
    updateWorkflow: (payload: UpdateWorkflowInput) =>
      updateWorkflow(dispatch, payload),
    resetUpdateWorkflow: () => dispatch(resetUpdateWorkflow()),
    getWorkflowsMetaData: (payload: GetWorkflowsMetaDataInput) => {
      getWorkflowsMetaData(dispatch, payload)
    }
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowEdit)

export default StyleComponent
