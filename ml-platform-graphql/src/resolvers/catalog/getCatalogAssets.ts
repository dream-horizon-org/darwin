import { WithdrawalsIO } from "../../utils"

export const getCatalogAssets = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getCatalogAssetsLoader.load(JSON.stringify(args))
