import { WithdrawalsIO } from "../../utils"

export const deleteModelDeploymentForId = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.deleteModelDeploymentForIdLoader.load(
    JSON.stringify(args)
  )
}
