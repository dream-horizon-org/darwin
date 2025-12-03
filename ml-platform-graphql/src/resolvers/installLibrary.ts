import { WithdrawalsIO } from "../utils"

export const installLibrary = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.installLibraryLoader.load(JSON.stringify(args))
