import {WithdrawalsIO} from '../../utils/src/constant.util'

export const getWorkflowsMetaData = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowsMetaDataLoader.load(JSON.stringify(args))
