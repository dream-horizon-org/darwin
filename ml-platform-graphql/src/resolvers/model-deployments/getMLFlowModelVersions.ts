import { WithdrawalsIO } from "../../utils"

export const getMLFlowModelVersions = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getMLFlowModelVersionsLoader.load(JSON.stringify(args))
}
