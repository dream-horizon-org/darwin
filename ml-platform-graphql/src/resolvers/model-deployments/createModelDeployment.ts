import { WithdrawalsIO } from "../../utils"

export const createModelDeployment = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const {input} = args
  return request.loader.createModelDeploymentLoader.load(JSON.stringify(input))
}
