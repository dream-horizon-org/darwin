import { WithdrawalsIO } from "../../../../utils"

export const getRuntimesInformationResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getRuntimesInformationLoader.load(JSON.stringify(args))
