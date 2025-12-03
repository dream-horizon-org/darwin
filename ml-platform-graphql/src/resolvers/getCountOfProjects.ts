import { WithdrawalsIO } from "../utils"

export const getCountOfProjects = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.user_id = msd_user.email
  return request.loader.getCountOfProjectsLoader.load(JSON.stringify(args))
}
