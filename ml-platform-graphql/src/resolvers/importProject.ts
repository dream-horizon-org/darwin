import { WithdrawalsIO } from "../utils"

export const importProject = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.user = msd_user.email
  return request.loader.importProjectLoader.load(JSON.stringify(args))
}
