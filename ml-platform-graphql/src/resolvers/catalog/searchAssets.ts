import { WithdrawalsIO } from "../../utils"

export const searchAssets = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.searchAssetsLoader.load(JSON.stringify(args))
