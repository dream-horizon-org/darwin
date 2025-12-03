import { WithdrawalsIO } from "../utils"
import {featureGroupsParser} from '../parser/feature-store/featureGroupsParser'

export const getFeatureGroups = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getFeatureGroupsLoader
    .load(JSON.stringify(args))
    .then((res) => featureGroupsParser(res, request))
