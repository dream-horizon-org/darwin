import { WithdrawalsIO } from "../utils"

export const getComputeGpuPods = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeGpuPodsLoader.load(JSON.stringify(args))
