import { WithdrawalsIO } from "../../utils"

// const mockResponse = (workflowId: string, maxConcurrentRuns: number) => {
//   return {
//     data: {
//       workflow_id: workflowId,
//       max_concurrent_runs: maxConcurrentRuns,
//     },
//   }
// }

export const updateWorkflowMaxConcurrentRuns = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.updateWorkflowMaxConcurrentRunsLoader.load(
    JSON.stringify(args)
  )
// .then((res) => mockResponse(args.workflowId, args.maxConcurrentRuns))
// .catch((err) => {
//   return mockResponse(args.workflowId, args.maxConcurrentRuns)
// })
