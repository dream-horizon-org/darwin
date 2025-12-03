import { WithdrawalsIO } from "../../utils"

export const createExperimentationUser = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.createExperimentationUserLoader.load(JSON.stringify(args))
