import { WithdrawalsIO } from "../../utils"
import {getWorkflowTaskDetailsParser} from './getWorkflowTaskDetails.parser'

export const getWorkflowTaskDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getWorkflowTaskDetailsLoader
    .load(JSON.stringify(args))
    .then((data) => getWorkflowTaskDetailsParser(request, data))
