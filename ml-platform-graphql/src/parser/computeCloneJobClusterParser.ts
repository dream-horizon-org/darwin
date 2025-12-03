import {CloneJobClusterResponse} from './computeCloneClusterParser.types'

export const computeCloneJobClusterParser = (res: CloneJobClusterResponse) => {
  const formattedRes = {
    status: res.status,
    data: {},
  }

  const data = {
    clusterId: res.data?.cluster_id || '',
    clusterName: res.data?.cluster_name || '',
    isJobCluster: res.data?.is_job_cluster || false,
    status: res.data?.status || '',
    tags: res.data?.tags || [],
    runtime: {
      id: 1,
      displayName: res.data?.runtime,
    },
    inactiveTime: res.data?.inactive_time,
    autoTerminationPolicies: res.data?.auto_termination_policies.map(
      (policy) => ({
        policyName: policy.policy_name,
        enabled: policy.enabled,
        params: {
          headNodeCpuUsageThreshold:
            policy.params.head_node_cpu_usage_threshold,
          workerNodeCpuUsageThreshold:
            policy.params.worker_node_cpu_usage_threshold,
        },
      })
    ),
    user: res.data?.user,
    headNodeConfig: {
      cores: res.data?.head_node_config.cores,
      memory: res.data?.head_node_config.memory,
      nodeType: res.data?.head_node_config.node_type,
      nodeCapacityType: res.data?.head_node_config.node_capacity_type,
      gpuPod: res.data?.head_node_config?.gpu_pod
        ? {
            name: res.data.head_node_config.gpu_pod.name,
            cores: res.data.head_node_config.gpu_pod.cores,
            memory: res.data.head_node_config.gpu_pod.memory,
            gpuCount: res.data.head_node_config.gpu_pod.gpu_count,
            gRamMemory: res.data.head_node_config.gpu_pod.g_ram_memory,
            gRamType: res.data.head_node_config.gpu_pod.g_ram_type,
          }
        : null,
    },
    workerNodeConfigs: res.data?.worker_node_configs.map((w) => ({
      coresPerPods: w.cores_per_pods,
      memoryPerPods: w.memory_per_pods,
      minPods: w.min_pods,
      maxPods: w.max_pods,
      diskSetting: {
        diskType: w.disk?.disk_type,
        storageSize: w.disk?.disk_size,
      },
      nodeType: w.node_type,
      nodeCapacityType: w.node_capacity_type,
      gpuPod: w.gpu_pod
        ? {
            name: w.gpu_pod.name,
            cores: w.gpu_pod.cores,
            memory: w.gpu_pod.memory,
            gpuCount: w.gpu_pod.gpu_count,
            gRamMemory: w.gpu_pod.g_ram_memory,
            gRamType: w.gpu_pod.g_ram_type,
          }
        : null,
    })),
    dashboards: {
      rayDashboardUrl: null,
      sparkUIUrl: null,
      grafanaDashboardUrl: null,
      resourceUtilizationDashboardUrl: null,
    },
    createdOn: res.data?.created_on,
    createdAt: res.data?.created_at,
    estimatedCost: res.data?.estimated_cost,
  }
  if (res.data?.advance_config) {
    Object.assign(data, {
      advanceConfig: {
        environmentVariables:
          res.data?.advance_config.environment_variables || '',
        logPath: res.data?.advance_config.log_path || '',
        initScript: res.data?.advance_config.init_script || '',
        instanceRole: res.data?.advance_config.instance_role
          ? {
              id: 1,
              displayName:
                res.data?.advance_config.instance_role.display_name || '',
              roleId: res.data?.advance_config.instance_role.id || '',
            }
          : {},
        availabilityZone: res.data?.advance_config.availability_zone
          ? {
              id: 1,
              displayName:
                res.data?.advance_config.availability_zone.display_name || '',
              zoneId: res.data?.advance_config.availability_zone.az_id || '',
            }
          : {},
        rayParams: {
          objectStoreMemory:
            res.data?.advance_config.ray_params?.object_store_memory,
          cpusOnHead: res.data?.advance_config.ray_params?.cpus_on_head,
        },
        spark_config: res.data?.advance_config?.spark_config || {},
      },
    })
  }

  formattedRes.data = data

  return formattedRes
}
