import { WithdrawalsIO } from "../utils"

export const getMavenPackageVersions = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getMavenPackageVersionsLoader.load(JSON.stringify(args))
