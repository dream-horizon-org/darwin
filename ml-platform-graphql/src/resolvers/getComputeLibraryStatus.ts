import { WithdrawalsIO } from "../utils"

export const getComputeLibraryStatus = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeLibraryStatusLoader.load(JSON.stringify(args))
