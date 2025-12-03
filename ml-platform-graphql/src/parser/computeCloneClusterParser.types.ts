type JobClusterWorkerNodesConfig = {
  cores_per_pods: number
  memory_per_pods: number
  min_pods: number
  max_pods: number
  disk: {
    disk_type: string
    disk_size: number
  }
  node_type: string
  node_capacity_type: string
  gpu_pod: {
    name: string
    cores: number
    memory: number
    gpu_count: number
    g_ram_memory: number
    g_ram_type: string
  }
}

type WorkerNodesConfig = {
  cores: number
  memory: number
  min_pods: number
  max_pods: number
  disk: {
    disk_type: string
    disk_size: number
  }
  node_type: string
  node_capacity_type: string
  gpu_pod: {
    name: string
    cores: number
    memory: number
    gpu_count: number
    g_ram_memory: number
    g_ram_type: string
  }
}

type TerminationPolicyParams = {
  head_node_cpu_usage_threshold?: number
  worker_node_cpu_usage_threshold?: number
}

type AutoTerminationPolicy = {
  policy_name: string
  enabled: boolean
  params: TerminationPolicyParams
}

type DashboardsData = {
  ray_dashboard_url: string
  spark_ui_url: string
  grafana_dashboard_url: string
  resource_utilization_dashboard_url: string
}

type Dashboards = {
  data: DashboardsData
}

type RayStartParams = {
  object_store_memory_perc: number
  num_cpus_on_head: number
  num_gpus_on_head: number
}

type JobClusterRayStartParams = {
  object_store_memory: number
  cpus_on_head: number
  gpus_on_head: number
}

export type CloneClusterResponse = {
  status: string
  data: {
    cluster_id: string
    name: string
    is_job_cluster: boolean
    status: string
    tags: Array<String>
    runtime: string
    inactive_time: number
    auto_termination_policies: Array<AutoTerminationPolicy>
    template: {
      template_id: number
      display_name: string
      memory_per_core: number
    }
    user: string
    head_node_config: {
      head_node_cores: number
      head_node_memory: number
      node_type: string
      node_capacity_type: string
      gpu_pod: {
        name: string
        cores: number
        memory: number
        gpu_count: number
        g_ram_memory: number
        g_ram_type: string
      }
    }
    worker_node_configs: Array<WorkerNodesConfig>
    jupyter_lab_url: string
    ray_dashboard_url: string
    created_on: string
    dashboards: Dashboards
    advance_config: {
      env_variables: string
      log_path: string
      init_script: string
      instance_role: {display_name: string; instance_role_id: string}
      availability_zone: {display_name: string; az_id: string}
      ray_start_params: RayStartParams
      spark_config: JSON
    }
  }
}

export type CloneJobClusterResponse = {
  status: string
  data: {
    cluster_id: string
    cluster_name: string
    is_job_cluster: boolean
    status: string
    tags: Array<String>
    runtime: string
    inactive_time: number
    auto_termination_policies: Array<AutoTerminationPolicy>
    template: {
      template_id: number
      display_name: string
      memory_per_core: number
    }
    user: string
    head_node_config: {
      cores: number
      memory: number
      node_type: string
      node_capacity_type: string
      gpu_pod: {
        name: string
        cores: number
        memory: number
        gpu_count: number
        g_ram_memory: number
        g_ram_type: string
      }
    }
    worker_node_configs: Array<JobClusterWorkerNodesConfig>
    jupyter_lab_url: string
    ray_dashboard_url: string
    created_on: string
    created_at: string
    estimated_cost: string
    dashboards: Dashboards
    advance_config: {
      environment_variables: string
      log_path: string
      init_script: string
      instance_role: {display_name: string; id: string}
      availability_zone: {display_name: string; az_id: string}
      ray_params: JobClusterRayStartParams
      spark_config: JSON
    }
  }
}
