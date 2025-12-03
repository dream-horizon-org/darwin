import { WithdrawalsIO } from "../../utils"

export const getFileContents = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getFileContentsLoader.load(JSON.stringify(args))
}
