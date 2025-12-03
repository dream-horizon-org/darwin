import { WithdrawalsIO } from "../utils"

export const getFeatureGroupEntities = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeatureGroupEntitiesLoader.load(JSON.stringify(args))
