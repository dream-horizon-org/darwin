interface ISearchedCluster {
  cluster_id: string
  name: string
  tags: string[]
  status: string
  runtime: string
  active_pod: number
  total_cores: number
  total_memory: number
  last_used_on: string
  create_by: string
  created_on: string
}

interface IAPIResponse {
  status: string
  result_size: number
  page_size: number
  offset: number
  data: ISearchedCluster[]
}

const parseClusters = async (request, data: IAPIResponse) => {
  const res = [] as any[]
  const requests: any = []
  for (const clusterData of data.data) {
    requests.push(
      request.loader.getClusterResourcesLoader.load(
        JSON.stringify({cluster_id: clusterData.cluster_id})
      )
    )
  }
  const clusterDetails = await Promise.allSettled(requests)
  data.data.forEach((cluster, index) => {
    const clusterResource = clusterDetails[index]

    if (clusterResource.status === 'fulfilled') {
      const clusterResources = clusterResource.value
      res.push({
        cluster_id: cluster.cluster_id,
        cluster_name: cluster.name,
        tags: cluster.tags,
        status: cluster.status,
        codespaces: 0,
        runtime: cluster.runtime,
        cores: {
          consumed: clusterResources?.data?.cores_used || 0,
          total: cluster.total_cores,
        },
        memory: {
          consumed: clusterResources?.data?.memory_used || 0,
          total: cluster.total_memory,
        },
        cost: 0,
        last_used_on: cluster.last_used_on,
        created_by: cluster.create_by,
        created_on: cluster.created_on,
      })
    } else {
      res.push({
        cluster_id: cluster.cluster_id,
        cluster_name: cluster.name,
        tags: cluster.tags,
        status: cluster.status,
        codespaces: 0,
        runtime: cluster.runtime,
        cores: {
          consumed: 0,
          total: cluster.total_cores,
        },
        memory: {
          consumed: 0,
          total: cluster.total_memory,
        },
        cost: 0,
        last_used_on: cluster.last_used_on,
        created_by: cluster.create_by,
        created_on: cluster.created_on,
      })
    }
  })
  return res
}

export const getSearchedClustersParser = async (
  request,
  data: IAPIResponse
) => {
  const parsedRes = {
    status: data.status,
    result_size: data.result_size,
    page_size: data.page_size,
    offset: data.offset,
    data: [] as any[],
  }
  parsedRes.data = await parseClusters(request, data)
  return parsedRes
}
