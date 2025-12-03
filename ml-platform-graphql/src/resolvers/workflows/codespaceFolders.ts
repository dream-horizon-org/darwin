import { WithdrawalsIO } from "../../utils"

// const mockResponse = () => {
//   return {
//     status: 'SUCCESS',
//     data: {
//       files: [
//         {
//           name: 'test1.py',
//         },
//         {
//           name: 'test2.py',
//         },
//       ],
//       sub_folders: [
//         {
//           name: 'test1',
//         },
//         {
//           name: 'test2',
//         },
//       ],
//     },
//   }
// }

export const codespaceFolders = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.codespaceFoldersLoader.load(JSON.stringify(args))
// .then(mockResponse)
// .catch(mockResponse)
