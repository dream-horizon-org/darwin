import { WithdrawalsIO } from "../utils"

export const fetchScheduleJobRuns = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.fetchScheduleJobRunsLoader.load(JSON.stringify(args))
