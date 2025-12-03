import { WithdrawalsIO } from "../utils"

export const getComputeLibraryDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeLibraryDetailsLoader.load(JSON.stringify(args))
