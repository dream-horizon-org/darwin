import { WithdrawalsIO } from "../../utils"

export const getWorkflowYaml = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowYamlLoader.load(JSON.stringify(args))
