import { WithdrawalsIO } from "../utils"

export const getLineageAsset = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getLineageAssetLoader.load(JSON.stringify(args))
