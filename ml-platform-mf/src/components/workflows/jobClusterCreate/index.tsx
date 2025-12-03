import {yupResolver} from '@hookform/resolvers/yup'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {FormProvider, useForm, useWatch} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {useDebounce} from '../../../hooks'
import {
  computeSchema,
  defaultDropdownValue,
  defaultWorker
} from '../../../modules/compute/pages/computeDetails/constants'
import {getComputeGpuPods} from '../../../modules/compute/pages/graphqlApis/getComputeGpuPods/index.thunk'
import {getComputeLimits} from '../../../modules/compute/pages/graphqlApis/getComputeLimits/getComputeLimits.thunk'
import {getComputeNodeTypes} from '../../../modules/compute/pages/graphqlApis/getComputeNodeTypes/index.thunk'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes
} from '../../../modules/compute/pages/graphqlApis/reducer'
import {
  formatClusterDetails,
  getParsedAdvanceConfig,
  processAutoTerminationPolicies
} from '../../../modules/compute/pages/utils'
import {CheckUniqueJobClusterNameInput} from '../../../modules/workflows/graphqlAPIs/checkUniqueJobClusterName'
import {checkUniqueJobClusterName} from '../../../modules/workflows/graphqlAPIs/checkUniqueJobClusterName/index.thunk'
import {CreateJobClusterDefinitionInput} from '../../../modules/workflows/graphqlAPIs/createJobClusterDefinition'
import {createJobClusterDefinition} from '../../../modules/workflows/graphqlAPIs/createJobClusterDefinition/index.thunk'
import {JobClusterDefinitionInput} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition'
import {jobClusterDefinition} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition/index.thunk'
import {IWorkflowCreateState} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {
  setCreateJobClusterDefinition,
  setUpdateJobClusterDefinition
} from '../../../modules/workflows/pages/workflows/actions'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {
  IComputeFormData,
  IComputeResource,
  IGpuPod
} from '../../../types/compute/common.type'
import {API_STATUS} from '../../../utils/apiUtils'
import {
  defaultAutoTerminationConfigs,
  policyNames
} from '../../compute/computeBasicConfiguration/computeTerminationConfiguration/constant'
import {nodeCapacityTypeConfig} from '../../compute/computeBasicConfiguration/constant'
import ComputeConfiguration from '../../compute/computeConfiguration/computeConfiguration'
import ComputeResources from '../../compute/computeResources/computeResources'
import ComputeTitleBarGeneric from '../../compute/computeTitleBarGeneric/computeTitleBarGeneric'
import SpinnerBackdrop from '../../spinnerBackdrop/spinnerBackdrop'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  computeLimits: IComputeLimits
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  createJobClusterDefinitionFunc: (
    payload: CreateJobClusterDefinitionInput
  ) => void
  createJobClusterDefinition: IWorkflowsState['createJobClusterDefinition']
  goBack: () => void
  resetCreateJobClusterDefinition: () => any
  clusterDefinitionId?: string
  jobClusterDefinitionFunc: (data: JobClusterDefinitionInput) => void
  jobClusterDefinition: IWorkflowsState['jobClusterDefinition']
  resetUpdateJobClusterDefinitionFunc: () => any
  checkUniqueJobClusterNameFunc: (data: CheckUniqueJobClusterNameInput) => void
  checkUniqueJobClusterName: IWorkflowCreateState['setCheckUniqueJobClusterName']
}

const JobClusterCreate = (props: IProps) => {
  const {
    classes,
    computeLimits,
    computeGpuPods,
    computeNodeTypes,
    createJobClusterDefinitionFunc,
    createJobClusterDefinition,
    goBack,
    resetCreateJobClusterDefinition,
    clusterDefinitionId,
    jobClusterDefinitionFunc,
    jobClusterDefinition,
    resetUpdateJobClusterDefinitionFunc,
    checkUniqueJobClusterNameFunc,
    checkUniqueJobClusterName
  } = props

  const [tagsToCreate, setTagsToCreate] = useState([])

  const defaultFormValues = {
    workers: [defaultWorker],
    autoTerminationPolicies: defaultAutoTerminationConfigs,
    inactiveInput: 60,
    nodeCapacityType: nodeCapacityTypeConfig.onDemand.name,
    advance: {
      rayParams: {
        objectStoreMemory: 25,
        cpusOnHead: 0
      }
    },
    disabledForm: false,
    isJobCluster: true
  }

  const customClusterNameValidation = useCallback(
    (_value: string) => {
      if (checkUniqueJobClusterName.status === API_STATUS.SUCCESS) {
        return checkUniqueJobClusterName.data?.is_unique
      }

      return true
    },

    [checkUniqueJobClusterName]
  )
  const methods = useForm<IComputeFormData>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(
      computeSchema(computeLimits, customClusterNameValidation)
    ),
    mode: 'onSubmit'
  })
  const {
    handleSubmit,
    formState: {errors},
    control,
    reset,
    setValue,
    getValues,
    watch,
    trigger
  } = methods

  useEffect(() => {
    if (clusterDefinitionId) {
      jobClusterDefinitionFunc({
        jobClusterDefinitionId: clusterDefinitionId
      })
    }
  }, [clusterDefinitionId])

  useEffect(() => {
    if (
      jobClusterDefinition.status === API_STATUS.SUCCESS &&
      jobClusterDefinition.data &&
      clusterDefinitionId &&
      clusterDefinitionId === jobClusterDefinition.data.clusterId
    ) {
      const prefillData = jobClusterDefinition.data
      reset(formatClusterDetails({...prefillData, isJobCluster: true}, false))
      resetUpdateJobClusterDefinitionFunc()
    }
  }, [jobClusterDefinition])

  const clusterName = watch('clusterName')

  useDebounce(
    () => {
      if (checkUniqueJobClusterName?.cancel) checkUniqueJobClusterName.cancel()
      if (clusterName) {
        checkUniqueJobClusterNameFunc({
          clusterName
        })
      }
    },
    300,
    [clusterName]
  )

  useEffect(() => {
    if (clusterName) trigger('clusterName')
  }, [customClusterNameValidation])

  const headCoreInput = useWatch({control, name: 'headCoreInput'})
  const headMemoryInputname = useWatch({control, name: 'headMemoryInput'})
  const headNodeCapacityType = useWatch({control, name: 'nodeCapacityType'})
  const workerConfig = useWatch({control, name: 'workers'})

  const [workerCorePods, workerMemoryPods] = workerConfig?.reduce(
    (prev, worker) => [
      prev[0] + Number(worker.corePods * worker.maxPods),
      prev[1] + Number(worker.memoryPods * worker.maxPods)
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

  const headGpu = useWatch({control, name: 'gpuPod'}) || defaultDropdownValue
  const headGpuCount = (headGpu.value as IGpuPod)?.gpuCount || 0
  const headGRamMemory = (headGpu.value as IGpuPod)?.gRamMemory || 0
  const workersGpuCount =
    workerConfig?.reduce((prev, worker) => {
      const gpuPodVal = worker.gpuPod?.value as IGpuPod
      return prev + Number(gpuPodVal?.gpuCount || 0)
    }, 0) || 0

  const computeResources: IComputeResource = {
    headCoreInput: Number(headCoreInput || 0) + workerCorePods,
    headMemoryInput: Number(headMemoryInputname || 0) + workerMemoryPods,
    headNodeCores: Number(headCoreInput || 0),
    headNodeMemory: Number(headMemoryInputname || 0),
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
    const gpuPod = data.gpuPod?.value as IGpuPod
    const variables = {
      input: {
        advanceConfig: getParsedAdvanceConfig(data.advance),
        autoTerminationPolicies: processAutoTerminationPolicies(
          data.autoTerminationPolicies
        ),
        clusterName: data.clusterName,
        headNodeConfig: {
          cores: data.headCoreInput,
          memory: data.headMemoryInput,
          nodeType: data.nodeType?.value || null,
          nodeCapacityType: data.nodeCapacityType,
          gpuPod: gpuPod || null
        },
        inactiveTime:
          data.autoTerminationPolicies.length > 0 ? data.inactiveInput : -1,
        runtime: data.runtime.value,
        tags: tagsToCreate || [],
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
        }))
      }
    }

    createJobClusterDefinitionFunc(variables)
  })

  const ComputeComp = (
    <>
      <SpinnerBackdrop
        show={jobClusterDefinition.status === API_STATUS.LOADING}
      />
      <FormProvider {...methods}>
        <div className={classes.container}>
          <form
            onSubmit={(ev) => {
              ev.preventDefault()
              ev.stopPropagation()
            }}
            className={classes.formContainer}
          >
            <div className={classes.title}>Cluster Details</div>
            <div className={classes.nameTagsContainerWrapper}>
              <div className={classes.nameTagsWrapper}>
                <div className={classes.nameTagsContainer}>
                  <ComputeTitleBarGeneric
                    control={control}
                    showTags={true}
                    tags={tagsToCreate || []}
                    updateTags={() => {}}
                    updatedTagList={(tags) => {
                      setTagsToCreate(tags)
                    }}
                  />
                </div>
                <ComputeConfiguration
                  control={control}
                  setValue={setValue}
                  computeLimits={computeLimits}
                  formErrors={errors}
                  computeGpuPods={computeGpuPods}
                  computeNodeTypes={computeNodeTypes}
                  getValues={getValues}
                  clusterId={clusterDefinitionId}
                />
              </div>
              <ComputeResources
                computeResources={computeResources}
                stickyTopValue={0}
                headCoreInput={headCoreInput}
                headMemoryInput={headMemoryInputname}
                workers={workerConfig}
                headNodeCapacityType={headNodeCapacityType}
                gpuPod={headGpu}
              />
            </div>
            <div className={classes.actionBar}>
              <div className={classes.actionBarBtnWrapper}>
                <Button
                  buttonText={'Cancel'}
                  onClick={() => reset()}
                  variant={ButtonVariants.TERTIARY}
                />
              </div>
              <div
                className={classes.actionBarBtnWrapper}
                data-testid='create-cluster-definition-button'
              >
                <Button
                  buttonText={
                    createJobClusterDefinition.status === API_STATUS.LOADING
                      ? 'Creating Cluster Definition...'
                      : 'Create Cluster Definition'
                  }
                  onClick={onSubmit}
                  disabled={
                    createJobClusterDefinition.status === API_STATUS.LOADING
                  }
                />
              </div>
            </div>
          </form>
        </div>
      </FormProvider>
    </>
  )

  useEffect(() => {
    if (createJobClusterDefinition.status === API_STATUS.SUCCESS) {
      resetCreateJobClusterDefinition()
      goBack()
    }
  }, [createJobClusterDefinition])

  return ComputeComp
}

const mapStateToProps = (state: CommonState) => ({
  computeLimits: state.computeReducer.computeLimits,
  computeGpuPods: state.computeReducer.computeGpuPods,
  computeNodeTypes: state.computeReducer.computeNodeTypes,
  createJobClusterDefinition: state.workflowsReducer.createJobClusterDefinition,
  jobClusterDefinition: state.workflowsReducer.jobClusterDefinition,
  checkUniqueJobClusterName:
    state.workflowCreateReducer.setCheckUniqueJobClusterName
})

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeLimits: () => getComputeLimits(dispatch),
    getComputeGpuPodsFunc: () => getComputeGpuPods(dispatch),
    getComputeNodeTypesFunc: () => getComputeNodeTypes(dispatch),
    createJobClusterDefinitionFunc: (
      payload: CreateJobClusterDefinitionInput
    ) => createJobClusterDefinition(dispatch, payload),
    resetCreateJobClusterDefinition: () =>
      dispatch(
        setCreateJobClusterDefinition({
          status: API_STATUS.INIT,
          data: null,
          error: null
        })
      ),
    jobClusterDefinitionFunc: (data: JobClusterDefinitionInput) =>
      jobClusterDefinition(dispatch, data),
    resetUpdateJobClusterDefinitionFunc: () =>
      dispatch(
        setUpdateJobClusterDefinition({
          status: API_STATUS.INIT,
          data: null,
          error: null
        })
      ),
    checkUniqueJobClusterNameFunc: (data: CheckUniqueJobClusterNameInput) =>
      checkUniqueJobClusterName(dispatch, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(JobClusterCreate)

export default StyleComponent
