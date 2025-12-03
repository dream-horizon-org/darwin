import { WithdrawalsIO } from "../utils"

// const mockResponse = () => {
//   return {
//     status: 'success',
//     data: [
//       {
//         codespace_id: 'test1',
//         codespace_name: 'test1 name',
//         created_by: 'test1 by',
//       },
//     ],
//   }
// }

export const getCodespaces = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.user = msd_user?.email
  return request.loader.getCodespacesLoader.load(JSON.stringify(args))
  // .then(mockResponse)
  // .catch(mockResponse)
}
