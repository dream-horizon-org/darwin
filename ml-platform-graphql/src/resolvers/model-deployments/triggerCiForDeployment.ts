import { WithdrawalsIO } from "../../utils"

export const triggerCiForDeployment = (io: WithdrawalsIO) => (
  _: Object,
  args: any,
  request: any
) => {
  return request.loader.triggerCiForDeploymentLoader.load(JSON.stringify(args))
}
