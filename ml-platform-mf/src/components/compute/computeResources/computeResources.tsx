import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import {LinearProgress} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import {connect} from 'react-redux'
import {Icons} from '../../../bit-components/icon/index'
import {ToolTipPlacement} from '../../../bit-components/tooltip/index'

import {get} from 'http'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useForm, useWatch} from 'react-hook-form'
import {compose} from 'redux'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {NodeTypeValue} from '../../../modules/compute/pages/constant'
import {
  PredictClusterCost,
  PredictClusterCostInput
} from '../../../modules/compute/pages/graphqlApis/predictClusterCost/predictClusterCost'
import {predictClusterCost} from '../../../modules/compute/pages/graphqlApis/predictClusterCost/predictClusterCost.thunk'
import {IClusterStatus} from '../../../modules/compute/pages/graphqlApis/reducer'
import {transformUserDetails} from '../../../modules/login/utils'
import {
  SHELL_LOADER_HEIGHT_CLUSTER_COST,
  SHELL_LOADER_WIDTH_CLUSTER_COST
} from '../../../modules/workflows/pages/workflows/constants'
import {IWorkspaceState} from '../../../modules/workspace/pages/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {
  IComputeFormData,
  IComputeResource,
  IGpuPod,
  MemoryUnits
} from '../../../types/compute/common.type'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import {useGQL} from '../../../utils/useGqlRequest'
import Info from '../../Info'
import {predefinedToolTips} from '../../Info/constants'
import styles from './computeResourcesJss'
interface IProps extends WithStyles<typeof styles> {
  computeResources: IComputeResource
  showClusterUsage?: boolean
  clusterResources: IWorkspaceState['clusterResources']
  clusterStatus: string
  clusterStatusState:
    | {
        status: any
        data: any
        error: any
      }
    | IClusterStatus
  predictClusterCost: {
    status: any
    data: any
    error: any
    cancel: () => void
  }
  stickyTopValue?: number
  getValues: ReturnType<typeof useForm>['getValues']
  control?: ReturnType<typeof useForm>['control']
  corePods: number[]
  minPods: number[]
  maxPods: number[]
  workerNodeCapacityType: string
  memoryPods: number[]
  headCoreInput: number
  headMemoryInput: number
  workers: any
  headNodeCapacityType: string
  gpuPod: {id: number; label: string; value: IGpuPod}
  predictClusterCostFunc: (variables: PredictClusterCostInput) => void
}

const ComputeResources = (props: IProps) => {
  const {
    classes,
    computeResources,
    showClusterUsage,
    clusterResources,
    clusterStatus,
    clusterStatusState,
    predictClusterCost,
    getValues,
    control,
    headCoreInput,
    headMemoryInput,
    headNodeCapacityType,
    workers,
    gpuPod,
    predictClusterCostFunc,
    stickyTopValue = 180
  } = props
  const [clusterConfigurationOpen, setClusterConfigurationOpen] =
    useState(false)

  const corePods = useMemo(() => workers?.map((d) => d.corePods), [workers])
  const minPods = useMemo(() => workers?.map((d) => d.minPods), [workers])
  const maxPods = useMemo(() => workers?.map((d) => d.maxPods), [workers])
  const workerNodeCapacityType = useMemo(
    () => workers?.map((d) => d.nodeCapacityType),
    [workers]
  )
  const memoryPods = useMemo(() => workers?.map((d) => d.memoryPods), [workers])

  const getMemoryUsed = () => {
    if (clusterResources?.data?.memory_used) {
      return Math.round(
        (clusterResources?.data?.memory_used / 100) *
          computeResources.headMemoryInput
      )
    }
    return 0
  }
  const getCoresUsed = () => {
    if (clusterResources?.data?.cores_used) {
      return Math.round(
        (clusterResources?.data?.cores_used / 100) *
          computeResources.headCoreInput
      )
    }
    return 0
  }
  const isFormValid = useCallback(() => {
    if (gpuPod.id === -1) {
      if (
        headCoreInput === undefined ||
        headCoreInput === null ||
        Number(headCoreInput) === 0 ||
        Number(headCoreInput) < 1 ||
        Number(headCoreInput) > 90
      ) {
        return false
      }
      if (
        headMemoryInput === undefined ||
        headMemoryInput === null ||
        Number(headMemoryInput) === 0 ||
        Number(headMemoryInput) < 1 ||
        Number(headMemoryInput) > 736
      ) {
        return false
      }
    }

    if (!workers || workers.length === 0) {
      return true
    }
    const hasInvalidWorker = workers.some((worker) => {
      if (
        worker.minPods === null ||
        worker.minPods === '' ||
        Number(worker.minPods) < 0 ||
        Number(worker.minPods) > Number(worker.maxPods)
      ) {
        return true
      }
      if (
        worker.maxPods === null ||
        worker.maxPods === '' ||
        Number(worker.maxPods) < 1
      ) {
        return true
      }
      if (worker?.nodeType?.value === NodeTypeValue.GPU) {
        return false
      }
      if (
        worker.corePods === null ||
        worker.corePods === '' ||
        Number(worker.corePods) < 1 ||
        Number(worker.corePods) > 90
      ) {
        return true
      }
      if (
        worker.memoryPods === null ||
        worker.memoryPods === '' ||
        worker.memoryPods < 1 ||
        worker.memoryPods > 736
      ) {
        return true
      }

      return false
    })

    if (hasInvalidWorker) {
      return false
    }
    return true
  }, [
    headCoreInput,
    headMemoryInput,
    corePods,
    minPods,
    maxPods,
    memoryPods,
    workers
  ])
  useEffect(() => {
    if (isFormValid()) {
      if (predictClusterCost?.cancel) {
        predictClusterCost?.cancel()
      }
      const variables = {
        input: {
          clusterName: '',
          tags: [],
          runtime: '',
          inactiveTime: -1,
          user: '',
          headNodeConfig: {
            cores: Number(headCoreInput),
            memory: Number(headMemoryInput),
            nodeCapacityType: headNodeCapacityType,
            nodeType: gpuPod.id !== -1 ? NodeTypeValue.GPU : NodeTypeValue.CPU,
            gpuPod: gpuPod.id !== -1 ? gpuPod.value : null
          },
          workerNodeConfigs: workers.map((d) => ({
            coresPerPods: Number(d.corePods),
            memoryPerPods: Number(d.memoryPods),
            minPods: Number(d.minPods),
            maxPods: Number(d.maxPods),
            nodeCapacityType: d.nodeCapacityType,
            nodeType:
              d?.nodeType?.value && d?.nodeType?.value === NodeTypeValue.GPU
                ? NodeTypeValue.GPU
                : NodeTypeValue.CPU,
            gpuPod:
              d?.nodeType?.value && d?.nodeType?.value === NodeTypeValue.GPU
                ? d?.gpuPod?.value
                : null
          }))
        }
      }

      predictClusterCostFunc(variables)
    }
  }, [
    headCoreInput,
    headMemoryInput,
    corePods,
    minPods,
    maxPods,
    workerNodeCapacityType,
    memoryPods,
    headNodeCapacityType,
    showClusterUsage,
    gpuPod,
    isFormValid
  ])

  return (
    <div className={classes.wrapper} style={{top: `${stickyTopValue}px`}}>
      <div className={classes.title}>
        <div>
          <IconButton
            onClick={() => {}}
            leadingIcon={Icons.ICON_MEMORY}
            actionableVariants={
              ActionableIconButtonVariants.ACTIONABLE_TERTIARY
            }
            size={IconButtonSizes.LARGE}
            actionable={true}
            disabled={true}
          />
        </div>
        <div className='name'>Cluster Summary</div>
        <div>
          <Info
            msg={predefinedToolTips.resourceConfiguration}
            placement={ToolTipPlacement.BottomEnd}
          />
        </div>
      </div>
      <div className={classes.resource}>
        <div className={classes.estimatedCost}>
          <div>Estimated Cost</div>
          <Info
            msg={predefinedToolTips.EstimatedCost}
            placement={ToolTipPlacement.BottomEnd}
          />
        </div>
        {predictClusterCost?.status === API_STATUS.LOADING ? (
          <ShellLoading
            height={SHELL_LOADER_HEIGHT_CLUSTER_COST}
            width={SHELL_LOADER_WIDTH_CLUSTER_COST}
          />
        ) : isFormValid() &&
          predictClusterCost?.data?.min_cost &&
          predictClusterCost?.data?.max_cost ? (
          <div>
            {predictClusterCost?.data?.min_cost ===
            predictClusterCost?.data?.max_cost
              ? `$ ${predictClusterCost?.data?.min_cost}/hr`
              : `$ ${predictClusterCost?.data?.min_cost}/hr - $ ${predictClusterCost?.data?.max_cost}/hr`}
          </div>
        ) : (
          <div>{'--'}</div>
        )}
      </div>
      {!(
        showClusterUsage &&
        (clusterStatusState?.data?.status === 'active' ||
          clusterStatus === 'active')
      ) && (
        <div>
          {!showClusterUsage && <hr className={classes.line} />}
          <div className={classes.detailsWrapper}>
            <div className={classes.resource}>
              <div>Total Cores:</div>
              <div>{computeResources.headCoreInput || '--'}</div>
            </div>
            <div className={classes.resource}>
              <div>Total Memory:</div>
              <div>
                {computeResources.headMemoryInput || '--'}{' '}
                <span className={classes.memoryUnit}>
                  {computeResources.headMemoryInput ? MemoryUnits.GB : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showClusterUsage &&
        (clusterStatusState?.data?.status === 'active' ||
          clusterStatus === 'active') && (
          <div className={classes.resource}>
            <div className={classes.overallCluster}>Overall Cluster Usage:</div>

            <div className={classes.usageContainer}>
              <div>
                <div className={classes.usageDetails}>
                  <div>
                    {getCoresUsed()}{' '}
                    <span className={classes.usageDescription}>Core</span>
                  </div>
                  <div className={classes.usageDescription}>
                    {clusterResources?.data?.cores_used || 0}%
                  </div>
                </div>
                <LinearProgress
                  variant='determinate'
                  value={clusterResources?.data?.cores_used}
                  className={classes.utilisedProgressBar}
                />
              </div>
              <div>
                <div className={classes.usageDetails}>
                  <div>
                    {getMemoryUsed()}{' '}
                    <span className={classes.usageDescription}>GB</span>
                  </div>
                  <div className={classes.usageDescription}>
                    {clusterResources?.data?.memory_used || 0}%
                  </div>
                </div>
                <LinearProgress
                  variant='determinate'
                  value={clusterResources?.data?.memory_used}
                  className={classes.utilisedProgressBar}
                />
              </div>
            </div>
          </div>
        )}
      <div
        className={classes.detailsBtn}
        onClick={() => setClusterConfigurationOpen(!clusterConfigurationOpen)}
      >
        {clusterConfigurationOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        <span data-testid='view-cluster-configuration-button'>
          View Cluster Configuration
        </span>
      </div>
      {clusterConfigurationOpen && (
        <div className={classes.advanceConfig}>
          <div>
            <div className={classes.advanceConfigTitle}>Head Config</div>
            <div className={classes.detailsWrapper}>
              <div className={classes.resource}>
                <div>Cores:</div>
                <div>{computeResources?.headNodeCores || '--'}</div>
              </div>
              <div className={classes.resource}>
                <div>Memory:</div>
                <div>
                  {computeResources?.headNodeMemory || '--'}{' '}
                  <span className={classes.memoryUnit}>
                    {computeResources?.headNodeMemory ? MemoryUnits.GB : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.advanceConfigWrapper}>
            <div className={classes.advanceConfigTitle}>Worker Configs</div>
            <div className={classes.detailsWrapper}>
              <div className={classes.resource}>
                <div>Min - Max Pods</div>
                {computeResources?.workedNodeMinPods &&
                computeResources?.workerNodeMaxPods ? (
                  <div>
                    {computeResources?.workedNodeMinPods} -{' '}
                    {computeResources?.workerNodeMaxPods}
                  </div>
                ) : (
                  <div>--</div>
                )}
              </div>
            </div>
          </div>
          <div className={classes.advanceConfigWrapper}>
            <div className={classes.detailsWrapper}>
              <div className={classes.resource}>
                <div>Cores/Pods</div>
                {computeResources?.workerMinCorePerPods &&
                computeResources?.workerMaxCorePerPods ? (
                  <div>
                    {computeResources?.workerMinCorePerPods} -{' '}
                    {computeResources?.workerMaxCorePerPods}
                  </div>
                ) : (
                  <div>--</div>
                )}
              </div>
              <div className={classes.resource}>
                <div>Memory/Pods</div>
                {computeResources?.workerMinMemoryPerPods &&
                computeResources?.workerMaxMemoryPerPods ? (
                  <div>
                    {computeResources?.workerMinMemoryPerPods} -{' '}
                    {computeResources?.workerMaxMemoryPerPods}{' '}
                    <span className={classes.memoryUnit}>GB</span>
                  </div>
                ) : (
                  <div>--</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
  computeReducer: CommonState['computeReducer']
  appDrawerDuck: any
}) => ({
  clusterResources: state.workspaceProjectReducer.clusterResources,
  clusterStatusState: state.computeReducer.clusterStatus,
  predictClusterCost: state.computeReducer.predictClusterCost
})

const mapDispatchToProps = (dispatch) => {
  return {
    predictClusterCostFunc: (variables) =>
      predictClusterCost(dispatch, variables)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ComputeResources)

export default styleComponent
