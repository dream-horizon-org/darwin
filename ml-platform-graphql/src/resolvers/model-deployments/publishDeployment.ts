import { WithdrawalsIO } from "../../utils"

export const publishDeployment = (io: WithdrawalsIO) => (
  _: Object,
  args: any,
  request: any
) => {
  return request.loader.publishDeploymentLoader.load(JSON.stringify(args))
}
