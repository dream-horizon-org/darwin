import { WithdrawalsIO } from "../../utils"

export const resumeWorkflowSchedule = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.resumeWorkflowScheduleLoader.load(JSON.stringify(args))
