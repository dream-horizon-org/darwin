import { WithdrawalsIO } from "../utils"

export const updateComputeClusterTags = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.updateComputeClusterTagsLoader.load(JSON.stringify(args))
