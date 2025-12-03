import { WithdrawalsIO } from "../utils"

type FetchFeatureGroupVersionsArgs = {
  featureGroupName: String
}

export const fetchFeatureGroupVersions = (io: WithdrawalsIO) => (
  current: Object,
  args: FetchFeatureGroupVersionsArgs,
  request: any
) => request.loader.fetchFeatureGroupVersionsLoader.load(JSON.stringify(args))
