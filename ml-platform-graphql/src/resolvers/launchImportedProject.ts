import { WithdrawalsIO } from "../utils"

export const launchImportedProject = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.launchImportedProjectLoader.load(JSON.stringify(args))
