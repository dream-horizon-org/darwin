import { WithdrawalsIO } from "../../../../utils"

export const getLogsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getLogsLoader.load(JSON.stringify(args))
