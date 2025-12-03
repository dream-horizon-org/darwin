import { WithdrawalsIO } from "../../utils"

export const getModelDeploymentForId = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getModelDeploymentForIdLoader.load(JSON.stringify(args))
}
