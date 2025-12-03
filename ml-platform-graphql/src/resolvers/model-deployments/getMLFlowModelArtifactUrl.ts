import { WithdrawalsIO } from "../../utils"

export const getMLFlowModelArtifactUrl = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getMLFlowModelArtifactUrlLoader.load(
    JSON.stringify(args)
  )
}
