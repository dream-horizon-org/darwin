import {
  ClusterDetailsResponse,
  FormattedResponse,
} from './computeClusterDetailsParser.types'

export const computeClusterDetailsParser = (res: ClusterDetailsResponse) => {
  const formattedRes: FormattedResponse = {
    status: res.status,
    resultSize: res.result_size,
    pageSize: res.page_size,
    offset: res.offset,
    data: [],
  }

  formattedRes.data = res.data.map((clusterDetails) => ({
    clusterId: clusterDetails.cluster_id,
    clusterName: clusterDetails.name,
    tags: clusterDetails.tags,
    status: clusterDetails.status,
    runtime: clusterDetails.runtime,
    activePod: clusterDetails.active_pod,
    totalPod: clusterDetails.total_pod,
    totalMemory: clusterDetails.total_memory,
    jupyterLabLink: clusterDetails.jupyter_lab_link,
    createBy: clusterDetails.create_by,
    createdOn: clusterDetails.created_on,
    lastUsedOn: clusterDetails.last_used_on,
  }))

  return formattedRes
}
