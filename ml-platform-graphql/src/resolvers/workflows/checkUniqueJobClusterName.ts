import { WithdrawalsIO } from "../../utils"

export const checkUniqueJobClusterName = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.checkUniqueJobClusterNameLoader.load(JSON.stringify(args))
