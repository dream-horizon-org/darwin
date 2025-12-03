import { WithdrawalsIO } from "../utils"

const fetchLibraryStatuses = async (
  current: Object,
  args: any,
  request: any
) => {
  const {library_ids: libraryIds, cluster_id} = args
  const requests: any[] = []

  for (const libraryId of libraryIds) {
    requests.push(
      request.loader.getComputeLibraryStatusLoader.load(
        JSON.stringify({cluster_id: cluster_id, library_id: libraryId})
      )
    )
  }

  let results: any = null
  try {
    results = await Promise.allSettled(requests)
  } catch (err) {
    throw new Error(`Error fetching library statuses: ${err}`)
  }

  return {
    data: libraryIds.map((libraryId, index) => {
      const result: any = results[index]
      result.value = result.value || {data: {}}
      return {
        library_id: libraryId,
        status: result.value.data.status || 'error',
      }
    }),
  }
}

export const getComputeLibraryStatuses = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => fetchLibraryStatuses(current, args, request)
