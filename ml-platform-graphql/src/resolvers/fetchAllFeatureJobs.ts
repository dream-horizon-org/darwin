import { WithdrawalsIO } from "../utils"

export const fetchAllFeatureJobs = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.fetchAllFeatureJobsLoader.load(JSON.stringify(args))
