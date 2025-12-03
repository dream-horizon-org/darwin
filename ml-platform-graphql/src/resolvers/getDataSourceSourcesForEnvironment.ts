import { WithdrawalsIO } from "../utils"

export const getDataSourceSourcesForEnvironment = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getDataSourceSourcesForEnvironmentLoader.load(
    JSON.stringify(args)
  )
