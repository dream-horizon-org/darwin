import { WithdrawalsIO } from "../utils"
import {featureGroupParser} from '../parser/feature-store/featureGroupParser'

export const getFeatureGroupDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getFeatureGroupDetailsLoader
    .load(JSON.stringify(args))
    .then((res) => featureGroupParser(res, request))
