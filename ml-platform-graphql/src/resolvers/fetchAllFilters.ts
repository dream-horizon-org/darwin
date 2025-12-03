import { WithdrawalsIO } from "../utils"

export const fetchAllFilters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.fetchAllFiltersLoader
    .load(JSON.stringify(args))
    .then((data) => {
      return data
    })
