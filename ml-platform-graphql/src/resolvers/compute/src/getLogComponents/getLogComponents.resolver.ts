import { WithdrawalsIO } from "../../../../utils"

export const getLogComponentsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getLogComponentsLoader.load(JSON.stringify(args))
