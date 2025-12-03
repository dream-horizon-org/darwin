import { WithdrawalsIO } from "../utils"

export const getComputeAvailabilityZones = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeAvailabilityZonesLoader.load(JSON.stringify(args))
