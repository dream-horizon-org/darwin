type ClusterDetails = {
  cluster_id: string
  name: string
  tags: Array<String>
  status: string
  runtime: string
  active_pod: number
  total_pod: number
  total_memory: number
  jupyter_lab_link: string
  create_by: string
  created_on: string
  last_used_on: string
}

export type ClusterDetailsResponse = {
  status: string
  result_size: number
  page_size: number
  offset: number
  data: Array<ClusterDetails>
}

type FormattedClusterDetails = {
  clusterId: string
  clusterName: string
  tags: Array<String>
  status: string
  runtime: string
  activePod: number
  totalPod: number
  totalMemory: number
  jupyterLabLink: string
  createBy: string
  createdOn: string
  lastUsedOn: string
}

export type FormattedResponse = {
  status: string
  resultSize: number
  pageSize: number
  offset: number
  data: Array<FormattedClusterDetails>
}
