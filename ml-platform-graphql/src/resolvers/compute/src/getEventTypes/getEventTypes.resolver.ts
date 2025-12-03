import { WithdrawalsIO } from "../../../../utils"

export const getEventTypesResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getEventTypesLoader.load(JSON.stringify(args))
}
