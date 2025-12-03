import { WithdrawalsIO } from "../utils"
import {startClusterDetailsParser} from '../parser/startClusterParser'

export const reStartCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.reStartClusterLoader
    .load(JSON.stringify(args))
    .then(startClusterDetailsParser)
