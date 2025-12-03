import {IConfiguration} from '../../../../types/compute/common.type'

export const autoTerminateConfiguration: {
  autoTerminate: IConfiguration
  alwaysRunning: IConfiguration
} = {
  autoTerminate: {
    name: 'autoTerminate',
    text: 'Auto Terminate'
  },
  alwaysRunning: {
    name: 'alwaysRunning',
    text: 'Always Running'
  }
}

export const policyNames = {
  JupyterLabActivity: 'JupyterLabActivity',
  ClusterCPUUsage: 'ClusterCPUUsage',
  ActiveRayJob: 'ActiveRayJob'
}

export const defaultAutoTerminationConfigs = [
  {
    policyName: 'JupyterLabActivity',
    enabled: true,
    params: {}
  },
  {
    policyName: 'ClusterCPUUsage',
    enabled: true,
    params: {
      headNodeCpuUsageThreshold: 100,
      workerNodeCpuUsageThreshold: 5
    }
  },
  {
    policyName: 'ActiveRayJob',
    enabled: true,
    params: {}
  }
]

export const defaultInactiveTime = 60
