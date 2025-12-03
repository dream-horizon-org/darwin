import { WithdrawalsIO } from "../../utils"

export const getEventSchema = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getEventSchemaLoader.load(JSON.stringify(args))
}
