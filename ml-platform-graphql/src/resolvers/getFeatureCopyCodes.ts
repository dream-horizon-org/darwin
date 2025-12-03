import { WithdrawalsIO } from "../utils"

export const getFeatureCopyCodes = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeatureCopyCodesLoader.load(JSON.stringify(args))
