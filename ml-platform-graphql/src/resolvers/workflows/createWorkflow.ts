import { WithdrawalsIO } from "../../utils"

// const mockResponse = (args) => {
//   return {
//     data: {
//       workflow_id: '12345',
//       workflow_name: 'Sample Workflow',
//       description: 'This is a sample workflow description.',
//       tags: ['tag1', 'tag2'],
//       schedule: '0 0 * * *',
//       retries: 3,
//       notify_on: 'workflow_completion',
//       max_concurrent_runs: 1,
//       created_by: 'user123',
//       last_updated_on: '2023-09-20T12:00:00Z',
//       created_at: '2023-09-19T15:30:00Z',
//       workflow_status: 'active',
//       tasks: [
//         {
//           task_name: 'Task 1',
//           source_type: 'git',
//           source: 'https://github.com/sample/repo',
//           file_path: 'scripts/task1.py',
//           dynamic_artifact: false,
//           cluster_type: 'Standard',
//           attached_cluster: {
//             cluster_id: 'cluster123',
//             runtime: 'Python 3.8',
//             cluster_name: 'Sample Cluster',
//             cluster_status: 'running',
//             memory: 4096,
//             cores: 4,
//             ray_dashboard: 'http://cluster123:8265',
//             logs_dashboard: 'http://cluster123:8266',
//             events_dashboard: 'http://cluster123:8267',
//           },
//           dependent_libraries: 'numpy, pandas',
//           input_parameters: {
//             param1: 'value1',
//             param2: 'value2',
//           },
//           retries: 2,
//           timeout: 3600,
//           depends_on: [],
//           task_validation_status: 'validated',
//           run_status: 'pending',
//         },
//         {
//           task_name: 'Task 2',
//           source_type: 'git',
//           source: 'https://github.com/sample/repo',
//           file_path: 'spark_jobs/job1.py',
//           dynamic_artifact: true,
//           cluster_type: 'BigData',
//           attached_cluster: {
//             cluster_id: 'cluster456',
//             runtime: 'Spark 3.0',
//             cluster_name: 'BigData Cluster',
//             cluster_status: 'running',
//             memory: 16384,
//             cores: 16,
//             ray_dashboard: '',
//             logs_dashboard: '',
//             events_dashboard: '',
//           },
//           dependent_libraries: 'pyspark',
//           input_parameters: {},
//           retries: 3,
//           timeout: 7200,
//           depends_on: ['Task 1'],
//           task_validation_status: 'validated',
//           run_status: 'pending',
//         },
//       ],
//       next_run_time: '2023-09-21T00:00:00Z',
//     },
//   }
// }

export const createWorkflow = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.createWorkflowLoader.load(JSON.stringify(args))
// .then(mockResponse)
// .catch(mockResponse)
