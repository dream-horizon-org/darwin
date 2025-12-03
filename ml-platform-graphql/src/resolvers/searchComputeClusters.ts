import { WithdrawalsIO } from "../utils"
import {computeClusterDetailsParser} from '../parser/computeClusterDetailsParser'

export const searchComputeClusters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  if (msd_user.email && Boolean(args.filterByMe)) {
    args.filters = {
      ...(args.filters || {}),
      user: [msd_user.email, ...(args.filters?.user || [])],
    }
  }
  return request.loader.searchComputeClustersLoader
    .load(JSON.stringify(args))
    .then(computeClusterDetailsParser)
}
