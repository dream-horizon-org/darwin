import { WithdrawalsIO } from "../utils"

export const uninstallLibrary = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.uninstallLibraryLoader.load(JSON.stringify(args))
