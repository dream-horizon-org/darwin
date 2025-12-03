import { WithdrawalsIO } from "../utils"

export const expandDataSource = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.expandDataSourceLoader.load(JSON.stringify(args))
