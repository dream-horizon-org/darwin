import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {Button, ButtonVariants} from '../../../../bit-components/button/index'

import {yupResolver} from '@hookform/resolvers/yup'
import {
  FormProvider,
  useForm,
  UseFormGetValues,
  useWatch
} from 'react-hook-form'

import {Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {setShowGlobalSpinner} from '../../../../actions/commonActions'
import {policyNames} from '../../../../components/compute/computeBasicConfiguration/computeTerminationConfiguration/constant'
import ComputeConfiguration from '../../../../components/compute/computeConfiguration/computeConfiguration'
import ComputeResources from '../../../../components/compute/computeResources/computeResources'
import {CommonState} from '../../../../reducers/commonReducer'
import {
  IComputeFormData,
  IComputeResource,
  IGpuPod
} from '../../../../types/compute/common.type'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {API_STATUS} from '../../../../utils/apiUtils'
import {logEvent} from '../../../../utils/events'
import {useGQL} from '../../../../utils/useGqlRequest'
import {GetClusterResources} from '../../../workspace/pages/graphqlApis/getClusterResources/getClusterResources'
import {getClusterResources} from '../../../workspace/pages/graphqlApis/getClusterResources/getClusterResources.thunk'
import {SelectionOnData as IComputeClusterDetails} from '../computeCreate/queryComputeDetails/getComputeCluster'
import {getComputeGpuPods} from '../graphqlApis/getComputeGpuPods/index.thunk'
import {getComputeLimits} from '../graphqlApis/getComputeLimits/getComputeLimits.thunk'
import {getComputeNodeTypes} from '../graphqlApis/getComputeNodeTypes/index.thunk'
import {
  IComputeGpuPods,
  IComputeLimits,
  IComputeNodeTypes,
  IComputeState
} from '../graphqlApis/reducer'

import {resetComputeRuntimeDetails} from '../graphqlApis/actions'
import {
  formatClusterDetails,
  getParsedAdvanceConfig,
  getParsedSparkConfig,
  processAutoTerminationPolicies
} from '../utils'
import styles from './computeDetailsJSS'
import {computeSchema, defaultDropdownValue, defaultWorker} from './constants'
import {
  UpdateComputeCluster,
  UpdateComputeClusterInput
} from './updateComputeCluster'
import {UpdateComputeClusterSchema} from './updateComputeCluster.gqlTypes'
import {GQL as updateComputeClusterGql} from './updateComputeClusterGql'

interface IProps extends WithStyles<typeof styles> {
  history?: any
  computeLimits: IComputeLimits
  defaultClusterDetails?: IComputeClusterDetails
  clusterId?: string
  getClusterDetailsFunc?: () => void
  getComputeLimits: () => void
  setShowGlobalSpinner: (payload: boolean) => void
  resetComputeRuntimeDetails: () => void
  getClusterResources: (payload: any) => void
  clusterResources: {
    status: API_STATUS
    data: GetClusterResources['getClusterResources']['data']
    error: any
  }
  getComputeGpuPodsFunc: () => void
  computeGpuPods: IComputeGpuPods
  getComputeNodeTypesFunc: () => void
  computeNodeTypes: IComputeNodeTypes
  getValues: UseFormGetValues<IComputeFormData>
  computeRuntimeDetails: IComputeState['computeRuntimeDetails']
}

const ComputeDetails = (props: IProps) => {
  const {
    classes,
    computeLimits,
    defaultClusterDetails,
    clusterId,
    getClusterDetailsFunc,
    getComputeLimits,
    setShowGlobalSpinner,
    getClusterResources,
    resetComputeRuntimeDetails,
    clusterResources,
    computeGpuPods,
    computeRuntimeDetails,
    computeNodeTypes
  } = props

  const {
    output: {
      response: updateComputeClusterResponse,
      loading: updateComputeClusterLoading,
      errors: updateComputeClusterError
    },
    triggerGQLCall: updateComputeCluster
  } = useGQL<UpdateComputeClusterInput, UpdateComputeCluster>()

  const methods = useForm<IComputeFormData>({
    defaultValues: {
      workers: [defaultWorker],
      inactiveInput: 60,
      disabledForm: Boolean(defaultClusterDetails?.isJobCluster || false),
      isJobCluster: Boolean(defaultClusterDetails?.isJobCluster || false)
    },
    resolver: yupResolver(computeSchema(computeLimits)),
    mode: 'onChange'
  })
  const {
    handleSubmit,
    formState: {isDirty, dirtyFields, errors},
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
    let event
    if (defaultClusterDetails) {
      clearInterval(event)
      getClusterResources({
        clusterId: defaultClusterDetails.clusterId
      })
      event = setInterval(() => {
        getClusterResources({
          clusterId: defaultClusterDetails.clusterId
        })
      }, 5000)
      reset(formatClusterDetails(defaultClusterDetails))
    }

    return () => {
      clearInterval(event)
    }
  }, [defaultClusterDetails])

  useEffect(() => {
    getComputeLimits()

    logEvent(EventTypes.COMPUTE.DETAILS_OPEN, SeverityTypes.INFO)

    return () => {
      resetComputeRuntimeDetails()
    }
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
    const variables = {
      input: {
        clusterId: clusterId,
        data: {
          clusterName: data.clusterName,
          tags: defaultClusterDetails?.tags || [],
          runtime: data.runtime.value,
          inactiveTime:
            data.autoTerminationPolicies.length > 0 ? data.inactiveInput : -1,
          autoTerminationPolicies: processAutoTerminationPolicies(
            data.autoTerminationPolicies
          ),
          // template: {
          //   id: data.template.templateId,
          //   displayName: data.template.value,
          //   memoryPerCore: Number(data.template.ratio)
          // },
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
    }
    updateComputeCluster(
      {
        ...updateComputeClusterGql,
        variables
      },
      UpdateComputeClusterSchema
    )
  })

  useEffect(() => {
    if (
      !updateComputeClusterLoading &&
      updateComputeClusterResponse &&
      updateComputeClusterResponse.updateComputeCluster &&
      updateComputeClusterResponse.updateComputeCluster.status === 'SUCCESS'
    ) {
      setClusterUpdated({
        open: true,
        message: 'Cluster updated successfully!',
        type: 'SUCCESS'
      })
      getClusterDetailsFunc()
    } else if (!updateComputeClusterLoading && updateComputeClusterError) {
      setClusterUpdated({
        open: true,
        message: updateComputeClusterError[0].message,
        type: 'ERROR'
      })
    } else if (!updateComputeClusterLoading && updateComputeClusterResponse) {
      setClusterUpdated({
        open: true,
        message: 'Failed to update cluster!',
        type: 'ERROR'
      })
    }
  }, [updateComputeClusterResponse])

  const handleSnackbarClose = () => {
    setClusterUpdated({
      open: false,
      message: null,
      type: null
    })
  }

  useEffect(() => {
    setShowGlobalSpinner(updateComputeClusterLoading)
  }, [updateComputeClusterLoading])

  return (
    <div className={classes.container}>
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
      <FormProvider {...methods}>
        <form className={classes.formContainer}>
          <div className={classes.clusterDeatilsWrapper}>
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
              clusterId={clusterId}
            />
            <ComputeResources
              computeResources={computeResources}
              showClusterUsage={true}
              clusterResources={clusterResources}
              clusterStatus={defaultClusterDetails?.status}
              headCoreInput={headCoreInput}
              headMemoryInput={headMemoryInput}
              workers={workerConfig}
              headNodeCapacityType={headNodeCapacityType}
              gpuPod={headGpu}
            />
          </div>
          {!Boolean(defaultClusterDetails?.isJobCluster || false) && (
            <div className={classes.actionBar}>
              <div className={classes.actionBarBtnWrapper}>
                <Button
                  buttonText={'Cancel'}
                  onClick={() =>
                    reset(formatClusterDetails(defaultClusterDetails))
                  }
                  variant={ButtonVariants.TERTIARY}
                />
              </div>
              <div className={classes.actionBarBtnWrapper}>
                <Button
                  buttonText={'Update And Restart'}
                  onClick={onSubmit}
                  disabled={!isDirty}
                />
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    computeLimits: state.computeReducer.computeLimits,
    clusterResources: state.workspaceProjectReducer.clusterResources,
    computeGpuPods: state.computeReducer.computeGpuPods,
    computeNodeTypes: state.computeReducer.computeNodeTypes,
    computeRuntimeDetails: state.computeReducer.computeRuntimeDetails
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeLimits: () => getComputeLimits(dispatch),
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload)),
    resetComputeRuntimeDetails: () => dispatch(resetComputeRuntimeDetails()),
    getClusterResources: (payload) => getClusterResources(payload, dispatch),
    getComputeGpuPodsFunc: () => getComputeGpuPods(dispatch),
    getComputeNodeTypesFunc: () => getComputeNodeTypes(dispatch)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ComputeDetails)

export default styleComponent
