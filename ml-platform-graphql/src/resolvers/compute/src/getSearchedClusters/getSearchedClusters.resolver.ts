import { WithdrawalsIO } from "../../../../utils"
import {getSearchedClustersParser} from './getSearchedClusters.parser'

export const getSearchedClustersResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getSearchedClustersLoader
    .load(JSON.stringify(args))
    .then((data) => getSearchedClustersParser(request, data))
}
