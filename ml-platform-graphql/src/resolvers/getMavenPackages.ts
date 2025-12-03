import { WithdrawalsIO } from "../utils"

export const getMavenPackages = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getMavenPackagesLoader.load(JSON.stringify(args))
