import { WithdrawalsIO } from "../../utils"

export const getModelDeployments = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getModelDeploymentsLoader.load(JSON.stringify(args))
}
