import { WithdrawalsIO } from "../utils"

export const getDatabasesForEnvironmentAndSource = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getDatabasesForEnvironmentAndSourceLoader.load(
    JSON.stringify(args)
  )
