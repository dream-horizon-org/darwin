import { WithdrawalsIO } from "../../utils"

export const validateModelDeploymentName = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.validateModelDeploymentNameLoader.load(
    JSON.stringify(args)
  )
}
