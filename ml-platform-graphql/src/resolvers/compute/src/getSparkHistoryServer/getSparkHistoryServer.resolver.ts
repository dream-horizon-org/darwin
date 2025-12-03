import { WithdrawalsIO } from "../../../../utils"

export const getSparkHistoryServerResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getSparkHistoryServerLoader.load(JSON.stringify(args))
}
