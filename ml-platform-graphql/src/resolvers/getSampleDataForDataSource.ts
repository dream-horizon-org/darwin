import { WithdrawalsIO } from "../utils"

export const getSampleDataForDataSource = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getSampleDataForDataSourceLoader.load(JSON.stringify(args))
