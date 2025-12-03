import {yupResolver} from '@hookform/resolvers/yup'
import {Alert, Snackbar} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import {cons} from 'fp-ts/lib/ReadonlyNonEmptyArray'
import React, {useEffect, useState} from 'react'
import {FormProvider, useForm, useWatch} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {
  computeSchema,
  defaultDropdownValue,
  defaultWorker
} from '../../../modules/compute/pages/computeDetails/constants'
import {resetComputeRuntimeDetails} from '../../../modules/compute/pages/graphqlApis/actions'
import {getComputeGpuPods} from '../../../modules/compute/pages/graphqlApis/getComputeGpuPods/index.thunk'
import {getComputeLimits} from '../../../modules/compute/pages/graphqlApis/getComputeLimits/getComputeLimits.thunk'
import {getComputeNodeTypes} from '../../../modules/compute/pages/graphqlApis/getComputeNodeTypes/index.thunk'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes,
  IComputeState
} from '../../../modules/compute/pages/graphqlApis/reducer'
import {
  formatClusterDetails,
  getParsedAdvanceConfig,
  getParsedSparkConfig,
  processAutoTerminationPolicies
} from '../../../modules/compute/pages/utils'
import {JobClusterDefinitionInput} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition'
import {jobClusterDefinition} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition/index.thunk'
import {UpdateJobClusterDefinitionInput} from '../../../modules/workflows/graphqlAPIs/updateJobClusterDefinition'
import {updateJobClusterDefinition} from '../../../modules/workflows/graphqlAPIs/updateJobClusterDefinition/index.thunk'
import {setUpdateJobClusterDefinition} from '../../../modules/workflows/pages/workflows/actions'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {
  GetClusterResources,
  GetClusterResourcesInput
} from '../../../modules/workspace/pages/graphqlApis/getClusterResources/getClusterResources'
import {getClusterResources} from '../../../modules/workspace/pages/graphqlApis/getClusterResources/getClusterResources.thunk'
import {CommonState} from '../../../reducers/commonReducer'
import {
  IComputeFormData,
  IComputeResource,
  IGpuPod
} from '../../../types/compute/common.type'
import {API_STATUS} from '../../../utils/apiUtils'
import {policyNames} from '../../compute/computeBasicConfiguration/computeTerminationConfiguration/constant'
import ComputeConfiguration from '../../compute/computeConfiguration/computeConfiguration'
import ComputeResources from '../../compute/computeResources/computeResources'
import ComputeTitleBarGeneric from '../../compute/computeTitleBarGeneric/computeTitleBarGeneric'
import SpinnerBackdrop from '../../spinnerBackdrop/spinnerBackdrop'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  computeLimits: IComputeLimits
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  clusterDefnitionId: String
  getComputeGpuPodsFunc: () => void
  getComputeLimits: () => void
  getClusterResources: (payload: GetClusterResourcesInput) => void
  getComputeNodeTypesFunc: () => void
  resetComputeRuntimeDetails: () => void
  computeRuntimeDetails: IComputeState['computeRuntimeDetails']
  clusterResources: {
    status: API_STATUS
    data: GetClusterResources['getClusterResources']['data']
    error: any
  }
  clusterDefinitionId: string
  jobClusterDefinitionFunc: (data: JobClusterDefinitionInput) => void
  jobClusterDefinition: IWorkflowsState['jobClusterDefinition']
  goBack: () => void
  updateJobClusterDefinitionFunc: (
    data: UpdateJobClusterDefinitionInput
  ) => void
  updateJobClusterDefinition: IWorkflowsState['updateJobClusterDefinition']
  resetUpdateJobClusterDefinitionFunc: () => any
}

const JobClusterDetails = (props: IProps) => {
  const {
    classes,
    computeLimits,
    getComputeLimits,
    getClusterResources,
    computeGpuPods,
    computeNodeTypes,
    clusterDefinitionId,
    resetComputeRuntimeDetails,
    jobClusterDefinition,
    computeRuntimeDetails,
    jobClusterDefinitionFunc,
    goBack,
    updateJobClusterDefinitionFunc,
    updateJobClusterDefinition,
    resetUpdateJobClusterDefinitionFunc
  } = props

  const defaultClusterDetails = jobClusterDefinition.data

  useEffect(() => {
    if (clusterDefinitionId)
      jobClusterDefinitionFunc({
        jobClusterDefinitionId: clusterDefinitionId
      })
  }, [clusterDefinitionId])
  const methods = useForm<IComputeFormData & {tags: Array<string>}>({
    defaultValues: {
      workers: [defaultWorker],
      inactiveInput: 60,
      tags: [],
      advance: {
        rayParams: {
          objectStoreMemory: 25,
          cpusOnHead: 0
        }
      },
      disabledForm: false,
      isJobCluster: true
    },
    resolver: yupResolver(computeSchema(computeLimits)),
    mode: 'onChange'
  })
  const {
    handleSubmit,
    formState: {isDirty, errors},
    control,
    reset,
    setValue,
    getValues
  } = methods

  const [clusterUpdated, setClusterUpdated] = useState({
    open: false,
    message: null,
    type: null
  })

  useEffect(() => {
    if (defaultClusterDetails) {
      getClusterResources({
        clusterId: defaultClusterDetails.clusterId
      })

      reset({
        ...formatClusterDetails(defaultClusterDetails, false),
        isJobCluster: true,
        tags: defaultClusterDetails?.tags || []
      })
    }

    return () => {
      resetComputeRuntimeDetails()
    }
  }, [defaultClusterDetails])

  useEffect(() => {
    getComputeLimits()
  }, [])

  const headCoreInput =
    useWatch({
      control,
      name: 'headCoreInput',
      defaultValue: defaultClusterDetails?.headNodeConfig?.cores || 0
    }) || 0
  const headMemoryInput =
    useWatch({
      control,
      name: 'headMemoryInput',
      defaultValue: defaultClusterDetails?.headNodeConfig?.memory || 0
    }) || 0
  const headNodeCapacityType = useWatch({control, name: 'nodeCapacityType'})
  const workerConfig = useWatch({control, name: 'workers'})
  const [workerCorePods, workerMemoryPods] = workerConfig?.reduce(
    (prev, worker) => [
      prev[0] + Number(worker.corePods * worker.maxPods),
      prev[1] + Number(worker.memoryPods * worker.maxPods)
    ],
    [0, 0]
  ) || [0, 0]

  const [workerTotalMinCores, workerTotalMaxCores] = workerConfig?.reduce(
    (prev, worker) => [
      prev[0] + Number(worker.corePods * worker.minPods),
      prev[1] + Number(worker.corePods * worker.maxPods)
    ],
    [0, 0]
  ) || [0, 0]

  const [workerTotalMinMemory, workerTotalMaxMemory] = workerConfig?.reduce(
    (prev, worker) => [
      prev[0] + Number(worker.memoryPods * worker.minPods),
      prev[1] + Number(worker.memoryPods * worker.maxPods)
    ],
    [0, 0]
  ) || [0, 0]

  const [deafultWorkerCorePods, deafultWorkerMemoryPods] =
    defaultClusterDetails?.workerNodeConfigs?.reduce(
      (prev, worker) => [
        prev[0] + Number(worker.coresPerPods),
        prev[1] + Number(worker.memoryPerPods)
      ],
      [0, 0]
    ) || [0, 0]

  const [workerMinPods, workerMaxPods] = workerConfig?.reduce(
    (prev, worker) => [
      prev[0] + Number(worker.minPods),
      prev[1] + Number(worker.maxPods)
    ],
    [0, 0]
  ) || [0, 0]

  const tags = useWatch({control, name: 'tags'}) || []
  const headGpu = useWatch({control, name: 'gpuPod'}) || defaultDropdownValue
  const headGpuCount = (headGpu.value as IGpuPod)?.gpuCount || 0
  const headGRamMemory = (headGpu.value as IGpuPod)?.gRamMemory || 0
  const workersGpuCount =
    workerConfig?.reduce((prev, worker) => {
      const gpuPodVal = worker.gpuPod?.value as IGpuPod
      return prev + Number(gpuPodVal?.gpuCount || 0)
    }, 0) || 0

  const computeResources: IComputeResource = {
    headCoreInput:
      Number(headCoreInput) + workerCorePods ||
      defaultClusterDetails?.headNodeConfig.cores + deafultWorkerCorePods,
    headMemoryInput:
      Number(headMemoryInput) + workerMemoryPods ||
      defaultClusterDetails?.headNodeConfig.memory + deafultWorkerMemoryPods,
    headNodeCores: Number(headCoreInput || 0),
    headNodeMemory: Number(headMemoryInput || 0),
    workedNodeMinPods: Number(workerMinPods || 0),
    workerNodeMaxPods: Number(workerMaxPods || 0),
    workerMinCorePerPods: Number(workerTotalMinCores || 0),
    workerMaxCorePerPods: Number(workerTotalMaxCores || 0),
    workerMinMemoryPerPods: Number(workerTotalMinMemory || 0),
    workerMaxMemoryPerPods: Number(workerTotalMaxMemory || 0),
    maxGpuCount: headGpuCount + workersGpuCount,
    headGRamMemory: headGRamMemory
  }

  const onSubmit = handleSubmit((data) => {
    const variables: UpdateJobClusterDefinitionInput = {
      clusterId: clusterDefinitionId,
      input: {
        clusterName: data.clusterName,
        tags: data.tags,
        runtime: data.runtime.value,
        inactiveTime:
          data.autoTerminationPolicies.length > 0 ? data.inactiveInput : -1,
        autoTerminationPolicies: processAutoTerminationPolicies(
          data.autoTerminationPolicies
        ),
        headNodeConfig: {
          cores: data.headCoreInput,
          memory: data.headMemoryInput,
          nodeType: data.nodeType?.value || null,
          nodeCapacityType: data.nodeCapacityType,
          gpuPod: (data.gpuPod?.value as IGpuPod) || null
        },
        workerNodeConfigs: data.workers.map((d) => ({
          gpuPod: (d.gpuPod?.value as IGpuPod) || null,
          coresPerPods: d.corePods,
          memoryPerPods: d.memoryPods,
          minPods: d.minPods,
          maxPods: d.maxPods,
          nodeType: d.nodeType?.value || null,
          nodeCapacityType: d.nodeCapacityType,
          diskSetting:
            d.discType.value && d.storageSize
              ? {
                  diskType: d.discType.value,
                  storageSize: d.storageSize
                }
              : null
        })),
        advanceConfig: getParsedAdvanceConfig(
          data.advance,
          Boolean(
            computeRuntimeDetails?.data?.spark_auto_init ||
              computeRuntimeDetails?.data?.spark_connect ||
              false
          )
        )
      }
    }
    updateJobClusterDefinitionFunc(variables)
  })

  useEffect(() => {
    if (
      updateJobClusterDefinition.status === API_STATUS.SUCCESS &&
      updateJobClusterDefinition?.data?.job_cluster_definition_id
    ) {
      setClusterUpdated({
        open: true,
        message: 'Cluster definition updated successfully!',
        type: 'SUCCESS'
      })
      resetUpdateJobClusterDefinitionFunc()
      goBack()
    } else if (updateJobClusterDefinition.status === API_STATUS.ERROR) {
      setClusterUpdated({
        open: true,
        message: 'Cluster failed to update!',
        type: 'ERROR'
      })
    }
  }, [updateJobClusterDefinition])

  const handleSnackbarClose = () => {
    setClusterUpdated({
      open: false,
      message: null,
      type: null
    })
  }

  const ComputeComp = (
    <>
      <Snackbar
        open={clusterUpdated.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={clusterUpdated.type?.toLowerCase()}
          sx={{width: '100%'}}
        >
          {clusterUpdated.message}
        </Alert>
      </Snackbar>
      <SpinnerBackdrop
        show={jobClusterDefinition.status === API_STATUS.LOADING}
      />
      <FormProvider {...methods}>
        <div className={classes.container}>
          <form
            className={classes.formContainer}
            onSubmit={(ev) => {
              ev.preventDefault()
              ev.stopPropagation()
            }}
          >
            <div className={classes.title}>Cluster Details</div>
            <div className={classes.nameTagsContainerWrapper}>
              <div className={classes.nameTagsWrapper}>
                <div className={classes.nameTagsContainer}>
                  <ComputeTitleBarGeneric
                    showTags={true}
                    clusterName={defaultClusterDetails?.clusterName || ''}
                    tags={tags}
                    updateTags={() => {}}
                    updatedTagList={(tags) => {
                      setValue('tags', tags, {shouldDirty: true})
                    }}
                    clusterId={clusterDefinitionId}
                  />
                </div>
                <ComputeConfiguration
                  control={control}
                  deafultMemoryToCoreRatio={Number(
                    defaultClusterDetails?.template?.memoryPerCore || 0
                  )}
                  computeLimits={computeLimits}
                  setValue={setValue}
                  formErrors={errors}
                  computeGpuPods={computeGpuPods}
                  computeNodeTypes={computeNodeTypes}
                  getValues={getValues}
                  clusterId={clusterDefinitionId}
                />
              </div>
              <ComputeResources
                computeResources={computeResources}
                headCoreInput={headCoreInput}
                headMemoryInput={headMemoryInput}
                workers={workerConfig}
                headNodeCapacityType={headNodeCapacityType}
                gpuPod={headGpu}
                // showClusterUsage={true}
                // clusterResources={clusterResources}
                // clusterStatus={defaultClusterDetails?.status}
                stickyTopValue={0}
              />
            </div>
            <div className={classes.actionBar}>
              <div className={classes.actionBarBtnWrapper}>
                <Button
                  buttonText={'Cancel'}
                  onClick={() =>
                    reset({
                      ...formatClusterDetails(defaultClusterDetails, false),
                      tags: defaultClusterDetails?.tags || []
                    })
                  }
                  variant={ButtonVariants.TERTIARY}
                  disabled={
                    updateJobClusterDefinition.status === API_STATUS.LOADING
                  }
                />
              </div>
              <div className={classes.actionBarBtnWrapper}>
                <Button
                  buttonText={
                    updateJobClusterDefinition.status === API_STATUS.LOADING
                      ? 'Updating Definition...'
                      : 'Update Definition'
                  }
                  onClick={onSubmit}
                  disabled={
                    !isDirty ||
                    updateJobClusterDefinition.status === API_STATUS.LOADING
                  }
                />
              </div>
            </div>
          </form>
        </div>
      </FormProvider>
    </>
  )

  return ComputeComp
}

const mapStateToProps = (state: CommonState) => ({
  computeLimits: state.computeReducer.computeLimits,
  computeGpuPods: state.computeReducer.computeGpuPods,
  clusterResources: state.workspaceProjectReducer.clusterResources,
  computeNodeTypes: state.computeReducer.computeNodeTypes,
  jobClusterDefinition: state.workflowsReducer.jobClusterDefinition,
  updateJobClusterDefinition: state.workflowsReducer.updateJobClusterDefinition,
  computeRuntimeDetails: state.computeReducer.computeRuntimeDetails
})

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeLimits: () => getComputeLimits(dispatch),
    getComputeGpuPodsFunc: () => getComputeGpuPods(dispatch),
    getClusterResources: (payload) => getClusterResources(payload, dispatch),
    getComputeNodeTypesFunc: () => getComputeNodeTypes(dispatch),
    jobClusterDefinitionFunc: (data: JobClusterDefinitionInput) =>
      jobClusterDefinition(dispatch, data),
    updateJobClusterDefinitionFunc: (data: UpdateJobClusterDefinitionInput) =>
      updateJobClusterDefinition(dispatch, data),
    resetComputeRuntimeDetails: () => dispatch(resetComputeRuntimeDetails()),
    resetUpdateJobClusterDefinitionFunc: () =>
      dispatch(
        setUpdateJobClusterDefinition({
          status: API_STATUS.INIT,
          data: null,
          error: null
        })
      )
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(JobClusterDetails)

export default StyleComponent
