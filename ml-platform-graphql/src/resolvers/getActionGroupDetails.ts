import { WithdrawalsIO } from "../utils"

export const getActionGroupDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getActionGroupDetailsLoader.load(JSON.stringify(args))
