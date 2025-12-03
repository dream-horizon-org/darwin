import { WithdrawalsIO } from "../../utils"

export const deleteWorkflow = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.deleteWorkflowLoader
    .load(JSON.stringify(args))
    .then((res) => res.data)
