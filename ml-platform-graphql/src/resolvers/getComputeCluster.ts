import { WithdrawalsIO } from "../utils"
import {computeCloneClusterParser} from '../parser/computeCloneClusterParser'

export const getComputeCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getComputeClusterLoader
    .load(JSON.stringify(args))
    .then((res) => {
      const response = computeCloneClusterParser(res)
      return response
    })
    .catch((err) => {
      return err
    })
