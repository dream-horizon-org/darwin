import { WithdrawalsIO } from "../utils"

export const deleteCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.deleteClusterLoader
    .load(JSON.stringify(args))
    .then((res) => res.data)
