import { WithdrawalsIO } from "../../../../utils"

export const deleteRuntimeResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.deleteRuntimeLoader.load(JSON.stringify(args))
