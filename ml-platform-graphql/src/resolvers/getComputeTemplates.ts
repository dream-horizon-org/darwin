import { WithdrawalsIO } from "../utils"

export const getComputeTemplates = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeTemplatesLoader.load(JSON.stringify(args))
