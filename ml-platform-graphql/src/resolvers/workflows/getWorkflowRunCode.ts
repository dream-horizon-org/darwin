import { WithdrawalsIO } from "../../utils"

const mockedRes = {
  data: {
    workflow_id: '1234',
    run_id: '1234',
    code: 'const add = (a, b) => a + b',
  },
}

export const getWorkflowRunCode = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getWorkflowRunCodeLoader
    .load(JSON.stringify(args))
    .then(() => mockedRes)
    .catch(() => mockedRes)
