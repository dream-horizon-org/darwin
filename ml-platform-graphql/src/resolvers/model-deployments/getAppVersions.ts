import { WithdrawalsIO } from "../../utils"

export const getAppVersions = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getAppVersionsLoader.load(JSON.stringify(args))
}
