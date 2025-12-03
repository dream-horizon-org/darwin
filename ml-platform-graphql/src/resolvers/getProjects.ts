import { WithdrawalsIO } from "../utils"

// const mockResponse = () => {
//   return {
//     status: 'success',
//     data: [
//       {
//         project_id: 'test1',
//         project_name: 'test1',
//         number_of_codespaces: 1,
//         last_updated: '2021-09-20T12:00:00Z',
//         created_on: '2021-09-19T15:30:00Z',
//         created_by: 'user123',
//       },
//       {
//         project_id: 'test2',
//         project_name: 'test2',
//         number_of_codespaces: 2,
//         last_updated: '2021-09-20T12:00:00Z',
//         created_on: '2021-09-19T15:30:00Z',
//         created_by: 'user124',
//       },
//     ],
//   }
// }

export const getProjects = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const msd_user = request.res.req.msd_user
  args.user = args.user || msd_user.email
  return request.loader.getProjectsLoader.load(JSON.stringify(args))
  // .then(mockResponse)
  // .catch(mockResponse)
}
