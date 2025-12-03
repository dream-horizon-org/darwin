export type ClusterListingQueryParams = {
  query: string
  filters: {
    status: string[]
    users: string[]
  }
}
