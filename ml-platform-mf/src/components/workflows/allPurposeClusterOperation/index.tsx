import {CircularProgress, Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'

import {yupResolver} from '@hookform/resolvers/yup'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {useForm, useWatch} from 'react-hook-form'
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {
  setGlobalSnackBar,
  setShowGlobalSpinner,
  setSnackBar
} from '../../../actions/commonActions'
import {
  Button,
  ButtonSizes,
  ButtonTypes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {useDebounce} from '../../../hooks'
import {
  CreateComputeCluster,
  CreateComputeClusterInput
} from '../../../modules/compute/pages/computeCreate/createComputeCluster'
import {CreateComputeClusterSchema} from '../../../modules/compute/pages/computeCreate/createComputeCluster.gqlTypes'
import {GQL as createComputeClusterGql} from '../../../modules/compute/pages/computeCreate/createComputeClusterGql'
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
import {
  UpdateComputeCluster,
  UpdateComputeClusterInput
} from '../../../modules/compute/pages/computeDetails/updateComputeCluster'
import {UpdateComputeClusterSchema} from '../../../modules/compute/pages/computeDetails/updateComputeCluster.gqlTypes'
import {GQL as updateComputeClusterGql} from '../../../modules/compute/pages/computeDetails/updateComputeClusterGql'
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

const AllPurposeClusterOperation = (props: IProps) => {
  const {
    classes,
    computeLimits,
    computeGpuPods,
    computeNodeTypes,
    clusterID,
    mode,
    handleClose,
    onUpdate,
    onCreate,
    loading,
    sourceClusterType
  } = props

  const [tagsToCreate, setTagsToCreate] = useState([])

  const {
    output: {response: clusterDetails, loading: clusterDetailsLoading},
    triggerGQLCall: getClusterDetails
  } = useGQL<GetComputeClusterInput, GetComputeCluster>()

  useEffect(() => {
    if (clusterID && mode !== 'create') {
      const variables = {
        clusterId: clusterID
      }
      getClusterDetails(
        {...getComputeClusterGql, variables},
        GetComputeClusterSchema
      )
    }
  }, [clusterID])

  useEffect(() => {
    if (
      !clusterDetailsLoading &&
      clusterDetails &&
      clusterDetails.getComputeCluster &&
      clusterDetails.getComputeCluster.data
    ) {
      const prefillData = clusterDetails.getComputeCluster.data
      reset(formatClusterDetails(prefillData))
      setTagsToCreate(prefillData.tags)
    }
  }, [clusterDetailsLoading])

  const dispatch = useDispatch()

  const {
    output: {
      response: createComputeClusterResponse,
      loading: createComputeClusterLoading,
      errors: createComputeClusterError
    },
    triggerGQLCall: triggerCreateComputeCluster
  } = useGQL<CreateComputeClusterInput, CreateComputeCluster>()

  useEffect(() => {
    if (createComputeClusterResponse) {
      onCreate(
        createComputeClusterResponse?.createComputeCluster?.data?.cluster_id
      )
    } else if (createComputeClusterError) {
      dispatch(
        setGlobalSnackBar({
          open: true,
          message: 'Something went wrong',
          type: SnackbarType.ERROR
        })
      )
    }
  }, [createComputeClusterResponse, createComputeClusterError])

  const {
    output: {
      response: updateComputeClusterResponse,
      loading: updateComputeClusterLoading,
      errors: updateComputeClusterErrors
    },
    triggerGQLCall: triggerUpdateComputeCluster
  } = useGQL<UpdateComputeClusterInput, UpdateComputeCluster>()

  useEffect(() => {
    if (updateComputeClusterResponse) {
      onUpdate(clusterID)
    } else if (updateComputeClusterErrors) {
      dispatch(
        setGlobalSnackBar({
          open: true,
          message: 'Something went wrong',
          type: SnackbarType.ERROR
        })
      )
    }
  }, [updateComputeClusterResponse, updateComputeClusterErrors])

  const {
    handleSubmit,
    register,
    formState: {isValid, errors},
    control,
    reset,
    setValue,
    getValues
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

  const headCoreInput = useWatch({control, name: 'headCoreInput'})
  const headMemoryInputname = useWatch({control, name: 'headMemoryInput'})
  const workerConfig = useWatch({control, name: 'workers'})
  const headNodeCapacityType = useWatch({control, name: 'nodeCapacityType'})

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
      triggerCreateComputeCluster(
        {
          ...createComputeClusterGql,
          variables
        },
        CreateComputeClusterSchema
      )
    } else if (mode === 'edit') {
      triggerUpdateComputeCluster(
        {
          ...updateComputeClusterGql,
          variables: {
            input: {
              clusterId: clusterID,
              data: variables.input
            }
          }
        },
        UpdateComputeClusterSchema
      )
    }
  })
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

  const buttonText = useMemo(() => {
    if (createComputeClusterLoading || updateComputeClusterLoading || loading) {
      return 'ATTACHING...'
    }
    if (mode === 'create' || mode === 'clone') {
      return 'CREATE AND ATTACH'
    } else {
      return 'UPDATE AND ATTACH'
    }
  }, [createComputeClusterLoading, updateComputeClusterLoading, loading])
  return (
    <div className={classes.container}>
      {clusterDetailsLoading ? (
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
            createComputeClusterLoading ||
            updateComputeClusterLoading ||
            loading
          }
          onClick={handleClose}
        />
        <Button
          variant={ButtonVariants.PRIMARY}
          buttonText={buttonText}
          size={ButtonSizes.SMALL}
          disabled={
            createComputeClusterLoading ||
            updateComputeClusterLoading ||
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
)(AllPurposeClusterOperation)

export default StyleComponent
