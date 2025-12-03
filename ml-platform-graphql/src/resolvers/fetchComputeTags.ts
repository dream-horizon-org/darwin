import { WithdrawalsIO } from "../utils"

export const fetchComputeTags = (io: WithdrawalsIO) => (
  current: Object,
  args: {},
  request: any
) => request.loader.fetchComputeTagsLoader.load(JSON.stringify(args))
