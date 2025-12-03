import { WithdrawalsIO } from "../utils"

type FetchFilteredFeatureGroupsArgs = {
  pageSize: number
  offset: number
  query: string
  ownerEmail: string[]
  tags: string[]
  sortBy: string
  order: string
}

export const fetchFilteredFeatureGroups = (io: WithdrawalsIO) => (
  current: Object,
  args: FetchFilteredFeatureGroupsArgs,
  request: any
) => request.loader.fetchFilteredFeatureGroupsLoader.load(JSON.stringify(args))
