import {yupResolver} from '@hookform/resolvers/yup'
import {CircularProgress} from '@material-ui/core'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useForm, useWatch} from 'react-hook-form'
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {
  setGlobalSnackBar,
  setShowGlobalSpinner
} from '../../../actions/commonActions'
import {
  Button,
  ButtonSizes,
  ButtonTypes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {useDebounce} from '../../../hooks'
import {
  GetComputeCluster,
  GetComputeClusterInput
} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeCluster'
import {GetComputeClusterSchema} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeCluster.gqlTypes'
import {GQL as getComputeClusterGql} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeClusterGql'
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
import {
  CreateJobClusterDefinition,
  CreateJobClusterDefinitionInput
} from '../../../modules/workflows/graphqlAPIs/createJobClusterDefinition'
import {CreateJobClusterDefinitionSchema} from '../../../modules/workflows/graphqlAPIs/createJobClusterDefinition/index.gqlTypes'
import {createJobClusterDefinition} from '../../../modules/workflows/graphqlAPIs/createJobClusterDefinition/index.thunk'
import {GQL as createJobClusterDefinitionGql} from '../../../modules/workflows/graphqlAPIs/createJobClusterDefinition/indexGql'
import {
  JobClusterDefinition,
  JobClusterDefinitionInput
} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition'
import {JobClusterDefinitionSchema} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition/index.gqlTypes'
import {GQL as jobClusterDefinitionGql} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition/indexGql'
import {
  UpdateJobClusterDefinition,
  UpdateJobClusterDefinitionInput
} from '../../../modules/workflows/graphqlAPIs/updateJobClusterDefinition'
import {UpdateJobClusterDefinitionSchema} from '../../../modules/workflows/graphqlAPIs/updateJobClusterDefinition/index.gqlTypes'
import {GQL as updateJobClusterDefinitionGql} from '../../../modules/workflows/graphqlAPIs/updateJobClusterDefinition/indexGql'
import {ClusterOperations} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {CommonState, SnackbarType} from '../../../reducers/commonReducer'
import {
  IComputeFormData,
  IComputeResource,
  IGpuPod
} from '../../../types/compute/common.type'
import {useGQL} from '../../../utils/useGqlRequest'
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
  clusterID?: string
  mode: 'edit' | 'create' | 'clone'
  handleClose: () => void
  onCreate: (id: string) => void
  onUpdate: (id: string) => void
  loading: boolean
  sourceClusterType: ClusterOperations['metadata']['sourceClusterType']
}

const JobClusterOperation = (props: IProps) => {
  const {
    classes,
    computeLimits,
    computeGpuPods,
    computeNodeTypes,
    clusterID,
    mode,
    handleClose,
    onCreate,
    onUpdate,
    loading,
    sourceClusterType
  } = props

  const [tagsToCreate, setTagsToCreate] = useState([])

  const {
    output: {
      response: definitionDetailsResponse,
      loading: definitionDetailsLoading,
      errors: definitionDetailsErrors
    },
    triggerGQLCall: getJobClusterDefinition
  } = useGQL<JobClusterDefinitionInput, JobClusterDefinition>()

  const {
    output: {response: clusterDetails, loading: clusterDetailsLoading},
    triggerGQLCall: getClusterDetails
  } = useGQL<GetComputeClusterInput, GetComputeCluster>()

  useEffect(() => {
    if ((mode === 'clone' || mode === 'edit') && clusterID) {
      if (sourceClusterType === 'job') {
        getJobClusterDefinition(
          {
            ...jobClusterDefinitionGql,
            variables: {
              jobClusterDefinitionId: clusterID
            }
          },
          JobClusterDefinitionSchema
        )
      } else if (sourceClusterType === 'all_purpose') {
        getClusterDetails(
          {...getComputeClusterGql, variables: {clusterId: clusterID}},
          GetComputeClusterSchema
        )
      }
    }
  }, [mode, clusterID])

  const {
    output: {
      response: createJobClusterDefinitionResponse,
      loading: createJobClusterDefinitionLoading,
      errors: createJobClusterDefinitionErrors
    },
    triggerGQLCall: triggerCreateJobClusterDefinition
  } = useGQL<CreateJobClusterDefinitionInput, CreateJobClusterDefinition>()

  useEffect(() => {
    if (createJobClusterDefinitionResponse) {
      onCreate(
        createJobClusterDefinitionResponse?.createJobClusterDefinition?.data
          ?.job_cluster_definition_id
      )
    } else if (createJobClusterDefinitionErrors) {
      dispatch(
        setGlobalSnackBar({
          type: SnackbarType.ERROR,
          open: true,
          message: 'Something went wrong'
        })
      )
    }
  }, [createJobClusterDefinitionResponse, createJobClusterDefinitionErrors])
  const {
    output: {
      response: updateJobClusterDefinitionResponse,
      loading: updateJobClusterDefinitionLoading,
      errors: updateJobClusterDefinitionErrors
    },
    triggerGQLCall: triggerUpdateJobClusterDefinition
  } = useGQL<UpdateJobClusterDefinitionInput, UpdateJobClusterDefinition>()

  useEffect(() => {
    if (updateJobClusterDefinitionResponse) {
      onUpdate(
        updateJobClusterDefinitionResponse?.updateJobClusterDefinition?.data
          ?.job_cluster_definition_id
      )
    } else if (updateJobClusterDefinitionErrors) {
      dispatch(
        setGlobalSnackBar({
          type: SnackbarType.ERROR,
          open: true,
          message: 'Something went wrong'
        })
      )
    }
  }, [updateJobClusterDefinitionResponse, updateJobClusterDefinitionErrors])

  const {
    handleSubmit,
    formState: {errors},
    control,
    reset,
    setValue,
    getValues,
    trigger
  } = useForm<IComputeFormData>({
    defaultValues: {
      disabledForm: false,
      workers: [defaultWorker],
      autoTerminationPolicies: defaultAutoTerminationConfigs,
      inactiveInput: 60,
      nodeCapacityType: nodeCapacityTypeConfig.onDemand.name,
      advance: {
        rayParams: {
          objectStoreMemory: 25,
          cpusOnHead: 0
        }
      }
    },
    resolver: yupResolver(computeSchema(computeLimits)),
    mode: 'onTouched'
  })

  const dispatch = useDispatch()
  useEffect(() => {
    if (
      !definitionDetailsLoading &&
      definitionDetailsResponse?.jobClusterDefinition?.data
    ) {
      const prefillData = definitionDetailsResponse?.jobClusterDefinition?.data
      reset(formatClusterDetails({...prefillData, isJobCluster: true}, false))
      setTagsToCreate(prefillData.tags)
    }
  }, [definitionDetailsLoading, definitionDetailsResponse])

  useEffect(() => {
    if (!clusterDetailsLoading && clusterDetails?.getComputeCluster?.data) {
      const prefillData = clusterDetails.getComputeCluster.data
      reset(formatClusterDetails(prefillData))
    }
  }, [clusterDetailsLoading, clusterDetails])

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

    if (mode === 'create' || mode === 'clone') {
      triggerCreateJobClusterDefinition(
        {
          ...createJobClusterDefinitionGql,
          variables: variables
        },
        CreateJobClusterDefinitionSchema
      )
    } else if (mode === 'edit') {
      triggerUpdateJobClusterDefinition(
        {
          ...updateJobClusterDefinitionGql,
          variables: {
            input: variables.input,
            clusterId: clusterID
          }
        },
        UpdateJobClusterDefinitionSchema
      )
    }
  })

  const buttonText = useMemo(() => {
    if (
      createJobClusterDefinitionLoading ||
      updateJobClusterDefinitionLoading ||
      loading
    ) {
      return 'ATTACHING...'
    }
    if (mode === 'create' || mode === 'clone') {
      return 'CREATE AND ATTACH'
    } else {
      return 'UPDATE AND ATTACH'
    }
  }, [
    createJobClusterDefinitionLoading,
    updateJobClusterDefinitionLoading,
    loading
  ])

  return (
    <div className={classes.container}>
      {definitionDetailsLoading || clusterDetailsLoading ? (
        <div className={classes.loaderContainer}>
          <CircularProgress size={60} />
          <span>Fetching Cluster Details...</span>
        </div>
      ) : null}

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
                updateTags={(tags: Array<string>) => {
                  setTagsToCreate(tags)
                }}
                updatedTagList={(tags) => {
                  setTagsToCreate(tags)
                }}
                clusterId={clusterID}
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
      </form>

      <div className={classes.footerContainer}>
        <Button
          variant={ButtonVariants.TERTIARY}
          buttonText='CANCEL'
          size={ButtonSizes.SMALL}
          disabled={
            createJobClusterDefinitionLoading ||
            updateJobClusterDefinitionLoading ||
            loading
          }
          onClick={handleClose}
        />
        <Button
          variant={ButtonVariants.PRIMARY}
          buttonText={buttonText}
          size={ButtonSizes.SMALL}
          disabled={
            createJobClusterDefinitionLoading ||
            updateJobClusterDefinitionLoading ||
            loading
          }
          type={ButtonTypes.SUBMIT}
          onClick={onSubmit}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  computeLimits: state.computeReducer.computeLimits,
  computeGpuPods: state.computeReducer.computeGpuPods,
  computeNodeTypes: state.computeReducer.computeNodeTypes
})

const mapDispatchToProps = (dispatch) => {}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(JobClusterOperation)

export default StyleComponent
