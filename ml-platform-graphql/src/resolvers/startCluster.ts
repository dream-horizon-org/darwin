import { WithdrawalsIO } from "../utils"
import {startClusterDetailsParser} from '../parser/startClusterParser'

export const startCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.startClusterLoader
    .load(JSON.stringify(args))
    .then(startClusterDetailsParser)
