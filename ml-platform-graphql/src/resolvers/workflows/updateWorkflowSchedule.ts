import { WithdrawalsIO } from "../../utils"

// const mockResponse = (workflowId: string, schedule: string) => {
//   return {
//     data: {
//       workflow_id: workflowId,
//       schedule,
//     },
//   }
// }

export const updateWorkflowSchedule = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.updateWorkflowScheduleLoader.load(JSON.stringify(args))
// .then((res) => mockResponse(args.workflowId, args.schedule))
// .catch((err) => {
//   return mockResponse(args.workflowId, args.schedule)
// })
