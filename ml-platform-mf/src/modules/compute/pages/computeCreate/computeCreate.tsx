import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Button, ButtonVariants} from '../../../../bit-components/button/index'

import {yupResolver} from '@hookform/resolvers/yup'
import {FormProvider, useForm, useWatch} from 'react-hook-form'

import {Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'
import React, {useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {setShowGlobalSpinner} from '../../../../actions/commonActions'
import {
  defaultAutoTerminationConfigs,
  policyNames
} from '../../../../components/compute/computeBasicConfiguration/computeTerminationConfiguration/constant'
import {nodeCapacityTypeConfig} from '../../../../components/compute/computeBasicConfiguration/constant'
import ComputeConfiguration from '../../../../components/compute/computeConfiguration/computeConfiguration'
import ComputeResources from '../../../../components/compute/computeResources/computeResources'
import ComputeTitleBar from '../../../../components/compute/computeTitleBar/computeTitleBar'
import useQuery from '../../../../components/useQuery'
import {routes} from '../../../../constants'
import {usePreventNavigation} from '../../../../hooks'
import {NavigationMode} from '../../../../hooks/src/usePreventNavigation/usePreventNavigation.hook'
import {CommonState} from '../../../../reducers/commonReducer'
import {
  IComputeFormData,
  IComputeResource,
  IGpuPod
} from '../../../../types/compute/common.type'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {logEvent} from '../../../../utils/events'
import {useGQL} from '../../../../utils/useGqlRequest'
import {
  computeSchema,
  defaultDropdownValue,
  defaultWorker
} from '../computeDetails/constants'
import {getComputeGpuPods} from '../graphqlApis/getComputeGpuPods/index.thunk'
import {getComputeLimits} from '../graphqlApis/getComputeLimits/getComputeLimits.thunk'
import {getComputeNodeTypes} from '../graphqlApis/getComputeNodeTypes/index.thunk'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes
} from '../graphqlApis/reducer'
import {
  formatClusterDetails,
  getParsedAdvanceConfig,
  processAutoTerminationPolicies
} from '../utils'
import styles from './computeCreateJSS'
import {
  CreateComputeCluster,
  CreateComputeClusterInput
} from './createComputeCluster'
import {CreateComputeClusterSchema} from './createComputeCluster.gqlTypes'
import {GQL as createComputeClusterGql} from './createComputeClusterGql'
import {
  GetComputeCluster,
  GetComputeClusterInput
} from './queryComputeDetails/getComputeCluster'
import {GetComputeClusterSchema} from './queryComputeDetails/getComputeCluster.gqlTypes'
import {GQL as getComputeClusterGql} from './queryComputeDetails/getComputeClusterGql'

interface IProps extends WithStyles<typeof styles> {
  history: any
  computeLimits: IComputeLimits
  getComputeLimits: () => void
  setShowGlobalSpinner: (payload: boolean) => void
  computeGpuPods: IComputeGpuPods
  getComputeGpuPodsFunc: () => void
  computeNodeTypes: IComputeNodeTypes
  getComputeNodeTypesFunc: () => void
}

const ComputeCreate = (props: IProps) => {
  const {
    classes,
    computeLimits,
    getComputeLimits,
    setShowGlobalSpinner,
    computeGpuPods,
    computeNodeTypes
  } = props
  const queryParams = useQuery()
  const cloneClusterId = queryParams.get('clone')

  const [tagsToCreate, setTagsToCreate] = useState([])

  const [clusterCreated, setClusterCreated] = useState({
    open: false,
    message: null,
    type: null,
    autoHideDuration: 3000
  })

  const {
    output: {response: clusterDetails, loading: clusterDetailsLoading},
    triggerGQLCall: getClusterDetails
  } = useGQL<GetComputeClusterInput, GetComputeCluster>()

  const {bypassGuard} = usePreventNavigation(
    'Are you sure?',
    'Are you sure you want to exit ? You will lose all unsaved changes.',
    NavigationMode.PUSH
  )

  useEffect(() => {
    if (cloneClusterId) {
      const variables = {
        clusterId: cloneClusterId
      }
      getClusterDetails(
        {...getComputeClusterGql, variables},
        GetComputeClusterSchema
      )
    }
  }, [cloneClusterId])

  const {
    output: {
      response: createComputeClusterResponse,
      loading: createComputeClusterLoading,
      errors: createComputeClusterError
    },
    triggerGQLCall: createComputeCluster
  } = useGQL<CreateComputeClusterInput, CreateComputeCluster>()

  useEffect(() => {
    if (
      !clusterDetailsLoading &&
      clusterDetails &&
      clusterDetails.getComputeCluster &&
      clusterDetails.getComputeCluster.data
    ) {
      const prefillData = clusterDetails.getComputeCluster.data
      reset(formatClusterDetails(prefillData))
    }
  }, [clusterDetailsLoading])

  useEffect(() => {
    if (
      createComputeClusterResponse?.createComputeCluster?.status === 'SUCCESS'
    ) {
      setClusterCreated({
        open: true,
        message: 'Cluster created successfully! redirecting to list page...',
        type: 'SUCCESS',
        autoHideDuration: 3000
      })
    } else if (createComputeClusterError) {
      setClusterCreated({
        open: true,
        message: createComputeClusterError[0].message,
        type: 'Error',
        autoHideDuration: 6000
      })
    }
  }, [createComputeClusterResponse, createComputeClusterError])
  const methods = useForm<IComputeFormData>({
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
        },
        spark_config: ''
      }
    },
    resolver: yupResolver(computeSchema(computeLimits)),
    mode: 'onTouched'
  })
  const {
    handleSubmit,
    register,
    formState: {isValid, errors},
    control,
    reset,
    setValue,
    getValues
  } = methods

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
        packages_clone_from:
          clusterDetails?.getComputeCluster?.data?.clusterId || null,
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

    createComputeCluster(
      {
        ...createComputeClusterGql,
        variables
      },
      CreateComputeClusterSchema
    )
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

  const handleSnackbarClose = () => {
    const redirect = clusterCreated.type === 'SUCCESS'
    setClusterCreated({
      open: false,
      message: null,
      type: null,
      autoHideDuration: 3000
    })
    if (redirect) bypassGuard(`${routes.compute}`)
  }

  useEffect(() => {
    getComputeLimits()

    logEvent(EventTypes.COMPUTE.CREATE_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
    if (clusterDetailsLoading || createComputeClusterLoading) {
      setShowGlobalSpinner(true)
    } else {
      setShowGlobalSpinner(false)
    }
  }, [clusterDetailsLoading, createComputeClusterLoading])

  return (
    <div className={classes.container}>
      <Snackbar
        open={clusterCreated.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={clusterCreated.type?.toLowerCase()}
          sx={{width: '100%'}}
        >
          {clusterCreated.message}
        </Alert>
      </Snackbar>
      <FormProvider {...methods}>
        <form
          onSubmit={(ev) => {
            ev.preventDefault()
            ev.stopPropagation()
          }}
          className={classes.formContainer}
        >
          <div className={classes.stickyHeader}>
            <ComputeTitleBar
              control={control}
              showTags={true}
              tags={tagsToCreate || []}
              updateTags={() => {}}
              updatedTagList={(tags) => {
                setTagsToCreate(tags)
              }}
            />
          </div>
          <div
            className={classes.title}
            data-testid='compute-create-heading-text'
          >
            Cluster Details
          </div>
          <div className={classes.clusterDeatilsWrapper}>
            <ComputeConfiguration
              control={control}
              setValue={setValue}
              computeLimits={computeLimits}
              formErrors={errors}
              computeGpuPods={computeGpuPods}
              computeNodeTypes={computeNodeTypes}
              getValues={getValues}
            />
            <ComputeResources
              getValues={getValues}
              control={control}
              headCoreInput={headCoreInput}
              headMemoryInput={headMemoryInputname}
              workers={workerConfig}
              headNodeCapacityType={headNodeCapacityType}
              gpuPod={headGpu}
              computeResources={computeResources}
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
              data-testid='compute-create-cluster-button'
            >
              <Button
                buttonText={'Create Cluster'}
                onClick={onSubmit}
                // disabled={!isValid}
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    computeLimits: state.computeReducer.computeLimits,
    computeGpuPods: state.computeReducer.computeGpuPods,
    computeNodeTypes: state.computeReducer.computeNodeTypes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeLimits: () => getComputeLimits(dispatch),
    getComputeGpuPodsFunc: () => getComputeGpuPods(dispatch),
    getComputeNodeTypesFunc: () => getComputeNodeTypes(dispatch),
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload))
  }
}

const styleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ComputeCreate)

export default styleComponent
