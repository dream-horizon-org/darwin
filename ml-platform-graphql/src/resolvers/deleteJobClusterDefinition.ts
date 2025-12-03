import { WithdrawalsIO } from "../utils"

export const deleteJobClusterDefinition = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.deleteJobClusterDefinitionLoader
    .load(JSON.stringify(args))
    .then((res) => res.data)
