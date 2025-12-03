import { WithdrawalsIO } from "../utils"

export const fetchCountOfJobs = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.fetchCountOfJobsLoader.load(JSON.stringify(args))
