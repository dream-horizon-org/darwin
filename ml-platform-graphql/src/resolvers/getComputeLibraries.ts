import { WithdrawalsIO } from "../utils"

export const getComputeLibraries = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeLibrariesLoader.load(JSON.stringify(args))
