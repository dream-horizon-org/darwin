import { WithdrawalsIO } from "../../utils"

// const mockResponse = (workflowId: string, tags: [string]) => {
//   return {
//     data: {
//       workflow_id: workflowId,
//       tags,
//     },
//   }
// }

export const updateWorkflowTags = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.updateWorkflowTagsLoader.load(JSON.stringify(args))
// .then((res) => mockResponse(args.workflowId, args.tags))
// .catch((err) => {
//   return mockResponse(args.workflowId, args.tags)
// })
