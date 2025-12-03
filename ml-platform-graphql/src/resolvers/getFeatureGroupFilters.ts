import { WithdrawalsIO } from "../utils"

export const getFeatureGroupFilters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeatureGroupFiltersLoader.load(JSON.stringify(args))
