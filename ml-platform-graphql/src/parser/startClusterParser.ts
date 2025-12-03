import {StartClusterResponse} from './startClusterParser.types'

export const startClusterDetailsParser = (res: StartClusterResponse) => {
  return {
    status: res.status,
    data: {
      cluster_id: res.data.ClusterName,
    },
  }
}
