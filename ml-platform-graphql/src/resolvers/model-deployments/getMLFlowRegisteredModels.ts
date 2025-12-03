import { WithdrawalsIO } from "../../utils"

export const getMLFlowRegisteredModels = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getMLFlowRegisteredModelsLoader.load(
    JSON.stringify(args)
  )
}
