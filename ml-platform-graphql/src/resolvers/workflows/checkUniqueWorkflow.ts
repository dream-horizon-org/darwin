import { WithdrawalsIO } from "../../utils"

// const mockResponse = () => {
//   const randomResponse = Math.random()
//   if (randomResponse > 0.5) {
//     return {
//       data: {
//         unique: true,
//       },
//     }
//   } else {
//     return {
//       data: {
//         unique: false,
//       },
//     }
//   }
// }

export const checkUniqueWorkflow = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.checkUniqueWorkflowLoader.load(JSON.stringify(args))
// .then((res) => {
//   console.log('Reached here success')
//   return mockResponse()
// })
// .catch((res) => {
//   console.log('Reached here error')
//   return mockResponse()
// })
