import { WithdrawalsIO } from "../../utils"

export const pauseWorkflowSchedule = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.pauseWorkflowScheduleLoader.load(JSON.stringify(args))
