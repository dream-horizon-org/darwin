// import {
//   GetAllJobClustersV2,
//   GetAllJobClustersV2Input,
//   SelectionOnGetAllJobClustersV2
// } from '.'
// import {API_STATUS} from '../../../../utils/apiUtils'
// import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
// import {setJobClusters} from '../../pages/workflowCreate/actions'
// import {GQL as getJobClustersGql} from './indexGql'

// export const getJobClusters = (
//   dispatch,
//   payload: GetAllJobClustersV2Input,
//   prevData: SelectionOnGetAllJobClustersV2
// ) => {
//   const gql = {
//     ...getJobClustersGql,
//     variables: payload
//   }

//   const gqlResponse = gqlRequestTyped<null, GetAllJobClustersV2>(gql)

//   dispatch(
//     setJobClusters({
//       status: API_STATUS.LOADING,
//       data: {data: prevData?.data, total_count: prevData?.total_count},
//       error: null,
//       cancel: gqlResponse.cancel
//     })
//   )

//   gqlResponse
//     .then((response) => {
//       if (response?.data?.getAllJobClustersV2?.data) {
//         if (prevData?.data) {
//           dispatch(
//             setJobClusters({
//               status: API_STATUS.SUCCESS,
//               data: {
//                 data: [
//                   ...prevData.data,
//                   ...response.data?.getAllJobClustersV2?.data
//                 ],
//                 total_count: response.data?.getAllJobClustersV2?.total_count || 0
//               },
//               error: null,
//               cancel: null
//             })
//           )
//         } else {
//           dispatch(
//             setJobClusters({
//               status: API_STATUS.SUCCESS,
//               data: {
//                 data: [...response.data?.getAllJobClustersV2?.data],
//                 total_count: response.data?.getAllJobClustersV2?.total_count
//               },
//               error: null,
//               cancel: null
//             })
//           )
//         }
//       } else {
//         dispatch(
//           setJobClusters({
//             status: API_STATUS.ERROR,
//             data: {data: [], total_count: 0},
//             error: null,
//             cancel: null
//           })
//         )
//       }
//     })
//     .catch((err) => {
//       dispatch(
//         setJobClusters({
//           status: API_STATUS.ERROR,
//           data: {data: [], total_count: 0},
//           error: err,
//           cancel: null
//         })
//       )
//     })
// }
