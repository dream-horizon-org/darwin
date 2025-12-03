import { WithdrawalsIO } from "../utils"

export const getDataSourceEnvironments = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getDataSourceEnvironmentsLoader.load(JSON.stringify(args))
