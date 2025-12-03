import { WithdrawalsIO } from "../../../../utils"

export const getFilterOptionsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getFilterOptionsLoader.load(JSON.stringify(args))
}
