import { WithdrawalsIO } from "../../utils"

// const mockedRes = {
//   message: 'Workflow run repaired successfully',
// }

export const repairWorkflowRun = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.repairWorkflowRunLoader.load(JSON.stringify(args))
//   .then(() => mockedRes)
//   .catch(() => mockedRes)
