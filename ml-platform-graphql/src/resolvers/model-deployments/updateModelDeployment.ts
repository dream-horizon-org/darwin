import { WithdrawalsIO } from "../../utils"

export const updateModelDeployment = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const {input} = args
  return request.loader.updateModelDeploymentLoader.load(JSON.stringify(input))
}
