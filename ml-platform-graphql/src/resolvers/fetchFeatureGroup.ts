import { WithdrawalsIO } from "../utils"
import {featureGroupDetailsParser} from '../parser/featureGroupDetailsParser'

type fetchFeatureGroupArgs = {
  featureGroupName: String
  version: String
}

export const fetchFeatureGroup = (io: WithdrawalsIO) => (
  current: Object,
  args: fetchFeatureGroupArgs,
  request: any
) =>
  request.loader.fetchFeatureGroupLoader
    .load(JSON.stringify(args))
    .then(featureGroupDetailsParser)
