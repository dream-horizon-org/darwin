import { WithdrawalsIO } from "../utils"
import {computeCloneJobClusterParser} from '../parser/computeCloneJobClusterParser'
// import {CloneClusterResponse} from '../parser/computeCloneClusterParser.types'

// const mockResponse = () => {
//   const mockInput: CloneClusterResponse = {
//     status: 'running',
//     data: {
//       cluster_id: '123456',
//       name: 'sample-cluster',
//       is_job_cluster: true,
//       status: 'active',
//       tags: ['tag1', 'tag2'],
//       runtime: 'Python 3.8',
//       inactive_time: 300,
//       auto_termination_policies: [
//         {
//           policy_name: 'policy1',
//           enabled: true,
//           params: {
//             head_node_cpu_usage_threshold: 80,
//             worker_node_cpu_usage_threshold: 70,
//           },
//         },
//         {
//           policy_name: 'policy2',
//           enabled: false,
//           params: {
//             head_node_cpu_usage_threshold: 90,
//             worker_node_cpu_usage_threshold: 85,
//           },
//         },
//       ],
//       user: 'user123',
//       head_node_config: {
//         head_node_cores: 4,
//         head_node_memory: 16,
//         node_type: 'Standard',
//         node_capacity_type: 'OnDemand',
//         gpu_pod: {
//           name: 'gpu-pod1',
//           cores: 8,
//           memory: 32,
//           gpu_count: 2,
//           g_ram_memory: 16,
//           g_ram_type: 'GDDR6',
//         },
//       },
//       worker_node_configs: [
//         {
//           cores: 2,
//           memory: 8,
//           min_pods: 1,
//           max_pods: 4,
//           disk: {
//             disk_type: 'SSD',
//             disk_size: 100,
//           },
//           node_type: 'Standard',
//           node_capacity_type: 'OnDemand',
//           gpu_pod: {
//             name: 'gpu-pod1',
//             cores: 8,
//             memory: 32,
//             gpu_count: 2,
//             g_ram_memory: 16,
//             g_ram_type: 'GDDR6',
//           },
//         },
//       ],
//       dashboards: {
//         data: {
//           ray_dashboard_url: 'https://ray-dashboard-url.com',
//           spark_ui_url: 'https://spark-ui-url.com',
//           grafana_dashboard_url: 'https://grafana-dashboard-url.com',
//         },
//       },
//       created_on: '2023-09-22T12:00:00Z',
//       advance_config: {
//         env_variables: 'VAR1=val1,VAR2=val2',
//         log_path: '/path/to/logs',
//         init_script: 'init.sh',
//         instance_role: {
//           display_name: 'Role 1',
//           instance_role_id: 'role123',
//         },
//         availability_zone: {
//           display_name: 'Zone A',
//           az_id: 'zone123',
//         },
//         ray_start_params: {
//           object_store_memory_perc: 80,
//           num_cpus_on_head: 2,
//           num_gpus_on_head: 1,
//         },
//       },
//       template: {
//         template_id: 0,
//         display_name: '',
//         memory_per_core: 0,
//       },
//       jupyter_lab_url: '',
//       ray_dashboard_url: '',
//     },
//   }
//   return mockInput
// }

export const jobClusterDefinition = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.jobClusterDefinitionLoader
    .load(JSON.stringify(args))
    .then((res) => {
      const response = computeCloneJobClusterParser(res)
      return response
    })
