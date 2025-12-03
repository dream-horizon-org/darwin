import { WithdrawalsIO } from "../../utils"

export const getModelTables = (io: WithdrawalsIO) => (
  _: Object,
  args: any,
  request: any
) => {
  return request.loader.getModelTablesLoader.load(JSON.stringify(args))
}
