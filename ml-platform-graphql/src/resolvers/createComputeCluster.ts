import { WithdrawalsIO } from "../utils"

export const createComputeCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.input.user = msd_user.email
  return request.loader.createComputeClusterLoader.load(JSON.stringify(args))
}
