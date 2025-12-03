import { WithdrawalsIO } from "../../../../utils"

export const getLogLineDetailsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getLogLineDetailsLoader.load(JSON.stringify(args))
