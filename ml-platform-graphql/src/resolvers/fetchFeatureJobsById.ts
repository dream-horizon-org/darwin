import { WithdrawalsIO } from "../utils"

export const fetchFeatureJobsById = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.fetchFeatureJobByIdLoader.load(JSON.stringify(args))
