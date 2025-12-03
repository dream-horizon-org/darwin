import { WithdrawalsIO } from "../utils"

export const updateComputeCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.input.data.user = (msd_user || {email: 'user'}).email
  return request.loader.updateComputeClusterLoader.load(JSON.stringify(args))
}
