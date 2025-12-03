import { WithdrawalsIO } from "../../utils"
import {getWorkflowTaskDetailsWithoutRunParser} from './getWorkflowTaskDetailsWithoutRun.parser'

export const getWorkflowTaskDetailsWithoutRun = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getWorkflowTaskDetailsWithoutRunLoader
    .load(JSON.stringify(args))
    .then((data) => getWorkflowTaskDetailsWithoutRunParser(request, data))
