import { WithdrawalsIO } from "../../utils"

export const validateEdgeTableName = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.validateEdgeTableNameLoader.load(JSON.stringify(args))
}
