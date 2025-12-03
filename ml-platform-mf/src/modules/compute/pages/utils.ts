import {
  autoTerminateConfiguration,
  policyNames
} from '../../../components/compute/computeBasicConfiguration/computeTerminationConfiguration/constant'
import {defaultAutoTerminationConfigs} from '../../../components/compute/computeBasicConfiguration/computeTerminationConfiguration/constant'
import {nodeTypeList} from '../../../components/compute/computeBasicConfiguration/constant'
import {SelectionOnData as IComputeClusterDetails} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeCluster'
import {
  IAutoTerminationPolicies,
  IGpuPod
} from '../../../types/compute/common.type'
import {defaultDropdownValue} from './computeDetails/constants'

export const getNodeTypeFromValue = (value: string) => {
  return nodeTypeList.find((d) => d.value === value)
}

export const getGpuNameFromGpuPod = (gpuPod: IGpuPod) =>
  `${gpuPod.name} ${gpuPod.gpuCount}g (${gpuPod.cores} cores,${gpuPod.memory}GB memory, ${gpuPod.gRamMemory}GB ${gpuPod.gRamType})`

export const processAutoTerminationPolicies = (
  policies: IAutoTerminationPolicies[]
) => {
  return policies.map((policy) => {
    if (policy.policyName !== policyNames.ClusterCPUUsage || !policy.enabled) {
      policy.params = {}
    }
    if (policy.policyName === policyNames.ClusterCPUUsage && policy.enabled) {
      policy.params.headNodeCpuUsageThreshold =
        +policy.params.headNodeCpuUsageThreshold
      policy.params.workerNodeCpuUsageThreshold =
        +policy.params.workerNodeCpuUsageThreshold
    }

    return policy
  })
}

const formatSparkConfig = (config: object): string => {
  return Object.entries(config)
    .map(([key, value]) => `${key}= ${value}`)
    .join('\n')
}

export const formatClusterDetails = (
  prefillData: IComputeClusterDetails,
  disabledForm?: boolean
) => {
  const prefillFormData = {
    disabledForm:
      disabledForm === undefined
        ? Boolean(prefillData?.isJobCluster)
        : disabledForm,
    isJobCluster: prefillData?.isJobCluster,
    clusterName: prefillData.clusterName,
    // tags: prefillData.tags || [],
    runtime: {
      id: Number(prefillData?.runtime?.id ?? -1),
      label: prefillData?.runtime?.displayName ?? '',
      value: prefillData?.runtime?.displayName ?? ''
    },
    inactiveInput:
      prefillData.inactiveTime === -1 ? 60 : prefillData.inactiveTime,
    clusterTerminationConfiguration:
      prefillData.inactiveTime >= 0 &&
      prefillData.autoTerminationPolicies.length > 0
        ? autoTerminateConfiguration.autoTerminate.name
        : autoTerminateConfiguration.alwaysRunning.name,
    autoTerminationPolicies: defaultAutoTerminationConfigs.map(
      (defaultPolicy) => {
        const apiPolicy = prefillData.autoTerminationPolicies.find(
          (policy) => policy.policyName === defaultPolicy.policyName
        )
        if (apiPolicy) {
          if (apiPolicy.policyName === policyNames.ClusterCPUUsage) {
            if (!apiPolicy.params.headNodeCpuUsageThreshold) {
              apiPolicy.params.headNodeCpuUsageThreshold = 100
            }
            if (!apiPolicy.params.workerNodeCpuUsageThreshold) {
              apiPolicy.params.workerNodeCpuUsageThreshold = 5
            }
          }
          return {
            ...defaultPolicy,
            ...apiPolicy
          }
        }
        return {
          ...defaultPolicy,
          enabled: false
        }
      }
    ),
    headMemoryInput: prefillData.headNodeConfig.memory,
    headCoreInput: prefillData.headNodeConfig.cores,
    nodeType: getNodeTypeFromValue(prefillData.headNodeConfig.nodeType),
    gpuPod: prefillData.headNodeConfig.gpuPod
      ? {
          id: 0,
          label: getGpuNameFromGpuPod(prefillData.headNodeConfig.gpuPod),
          value: prefillData.headNodeConfig.gpuPod
        }
      : defaultDropdownValue,
    nodeCapacityType: prefillData.headNodeConfig.nodeCapacityType || 'ondemand',
    workers: prefillData.workerNodeConfigs.map((d) => ({
      gpuPod: d.gpuPod
        ? {
            id: 0,
            label: getGpuNameFromGpuPod(d.gpuPod),
            value: d.gpuPod
          }
        : defaultDropdownValue,
      corePods: d.coresPerPods,
      memoryPods: d.memoryPerPods,
      minPods: d.minPods,
      maxPods: d.maxPods,
      storageSize: d.diskSetting.storageSize,
      discType: {
        id: Number(1),
        label: d.diskSetting.diskType,
        value: d.diskSetting.diskType
      },
      nodeType: getNodeTypeFromValue(d.nodeType),
      nodeCapacityType: d.nodeCapacityType || 'ondemand'
    })),
    advance: {
      environmentVariables: prefillData.advanceConfig?.environmentVariables,
      logPath: prefillData.advanceConfig?.logPath,
      initScripts: prefillData.advanceConfig?.initScript,
      instanceRole:
        Object.values(prefillData.advanceConfig?.instanceRole || {}).filter(
          (val) => val
        ).length > 0
          ? {
              id: Number(prefillData.advanceConfig?.instanceRole?.id),
              roleId: prefillData.advanceConfig?.instanceRole?.roleId,
              label: prefillData.advanceConfig?.instanceRole?.displayName,
              value: prefillData.advanceConfig?.instanceRole?.displayName
            }
          : undefined,
      availabilityZone:
        Object.values(prefillData.advanceConfig?.availabilityZone || {}).filter(
          (val) => val
        ).length > 0
          ? {
              id: Number(prefillData.advanceConfig?.availabilityZone?.id),
              zoneId: prefillData.advanceConfig?.availabilityZone?.zoneId,
              value: prefillData.advanceConfig?.availabilityZone?.displayName,
              label: prefillData.advanceConfig?.availabilityZone?.displayName
            }
          : undefined,
      rayParams: prefillData.advanceConfig?.rayParams,
      spark_config: prefillData.advanceConfig?.spark_config
        ? formatSparkConfig(prefillData.advanceConfig.spark_config)
        : ''
    }
  }
  return prefillFormData
}

export const getParsedAdvanceConfig = (
  advanceConfig,
  isSparkEnabled = true
) => {
  const parsedAdvancedConfig = {}

  if (advanceConfig?.environmentVariables) {
    parsedAdvancedConfig['environmentVariables'] =
      advanceConfig.environmentVariables
  }

  if (advanceConfig?.logPath) {
    parsedAdvancedConfig['logPath'] = advanceConfig.logPath
  }

  if (advanceConfig?.initScripts) {
    parsedAdvancedConfig['initScript'] = advanceConfig.initScripts
  }

  if (advanceConfig?.instanceRole?.roleId) {
    parsedAdvancedConfig['instanceRole'] = {
      id: advanceConfig?.instanceRole?.roleId,
      displayName: advanceConfig?.instanceRole?.value
    }
  }

  if (advanceConfig?.availabilityZone?.zoneId) {
    parsedAdvancedConfig['availabilityZone'] = {
      id: advanceConfig?.availabilityZone?.zoneId,
      displayName: advanceConfig?.availabilityZone?.value
    }
  }

  if (advanceConfig?.rayParams) {
    parsedAdvancedConfig['rayParams'] = {
      objectStoreMemory: +advanceConfig?.rayParams?.objectStoreMemory,
      cpusOnHead: +advanceConfig?.rayParams?.cpusOnHead
    }
  }

  if (advanceConfig?.spark_config && isSparkEnabled) {
    parsedAdvancedConfig['spark_config'] = getParsedSparkConfig(
      advanceConfig.spark_config
    )
  }

  return parsedAdvancedConfig
}

export const getParsedSparkConfig = (spark_config) => {
  const parsedSparkConfig = {}
  const lines = spark_config.split('\n')
  lines.forEach((line) => {
    const [key, value] = line.split('=')
    if (key && value) {
      parsedSparkConfig[key.trim()] = value.trim()
    }
  })
  return parsedSparkConfig
}

export const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value)
}
