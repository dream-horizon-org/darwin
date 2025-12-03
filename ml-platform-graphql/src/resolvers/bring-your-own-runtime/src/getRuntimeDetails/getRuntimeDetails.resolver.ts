import { WithdrawalsIO } from "../../../../utils"

export const getRuntimeDetailsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getRuntimeDetailsLoader.load(JSON.stringify(args))
