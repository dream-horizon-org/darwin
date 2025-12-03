import { WithdrawalsIO } from "../utils"

export const detachCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.user = msd_user.email
  return request.loader.detachClusterLoader.load(JSON.stringify(args))
}
