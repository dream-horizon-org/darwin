import { WithdrawalsIO } from "../utils"

export const getComputeInstanceRoles = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeInstanceRolesLoader.load(JSON.stringify(args))
