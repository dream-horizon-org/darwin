import { WithdrawalsIO } from "../../utils"

// const mockResponse = (workflowId: string, retries: number) => {
//   return {
//     data: {
//       workflow_id: workflowId,
//       retries,
//     },
//   }
// }

export const updateWorkflowRetries = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.updateWorkflowRetriesLoader.load(JSON.stringify(args))
// .then((res) => mockResponse(args.workflowId, args.retries))
// .catch((err) => mockResponse(args.workflowId, args.retries))
