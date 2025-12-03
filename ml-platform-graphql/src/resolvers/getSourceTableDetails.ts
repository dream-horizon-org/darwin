import { WithdrawalsIO } from "../utils"

export const getSourceTableDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getSourceTableDetailsLoader.load(JSON.stringify(args))
