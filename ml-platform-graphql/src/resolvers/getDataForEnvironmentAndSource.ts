import { WithdrawalsIO } from "../utils"

export const getDataForEnvironmentAndSource = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getDataForEnvironmentAndSourceLoader.load(JSON.stringify(args))
