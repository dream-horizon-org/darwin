import { WithdrawalsIO } from "../utils"

export const retryInstallLibrary = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.retryInstallLibraryLoader.load(JSON.stringify(args))
