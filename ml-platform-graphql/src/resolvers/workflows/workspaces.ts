import { WithdrawalsIO } from "../../utils"

// const mockResponse = () => {
//   return {
//     status: 'success',
//     data: ['test1', 'test2', 'test3'],
//   }
// }

export const workspaces = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.workspacesLoader.load(JSON.stringify(args))
// .then(mockResponse)
// .catch(mockResponse)
