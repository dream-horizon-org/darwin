// import { WithdrawalsIO } from "../../../../utils"

import { WithdrawalsIO } from "../../../../utils"

interface IGetCodespacesResponse {
  status: string
  result_size: number
  page_size: number
  offset: number
  data: IGetCodespacesResponseData[]
}
interface IGetCodespacesResponseDataCodespace {
  id: string
  name: string
}
interface IGetCodespacesResponseDataProject {
  id: string
  name: string
}
interface IGetCodespacesResponseDataCores {
  consumed: number
  total: number
}
interface IGetCodespacesResponseDataMemory {
  consumed: number
  total: number
}
interface IGetCodespacesResponseData {
  codespace: IGetCodespacesResponseDataCodespace
  project: IGetCodespacesResponseDataProject
  cores: IGetCodespacesResponseDataCores
  memory: IGetCodespacesResponseDataMemory
  attached_since: string
  user: string
}

const getData = (): IGetCodespacesResponseData[] => {
  const codespaces: IGetCodespacesResponseData[] = []

  for (let i = 0; i < 50; i++) {
    codespaces.push({
      project: {
        id: 'project-id',
        name: 'project-name',
      },
      attached_since: '2021-01-01T00:00:00Z',
      codespace: {
        id: 'codespace-id',
        name: 'codespace-name',
      },
      cores: {
        consumed: 1,
        total: 8,
      },
      memory: {
        consumed: 64,
        total: 512,
      },
      user: 'user@example.com',
    })
  }

  return codespaces
}

export const getAllCodespacesResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  const data = getData()
  const {page_size, offset} = args

  const finalData = data.slice(offset, offset + page_size)

  const mocked: IGetCodespacesResponse = {
    status: 'SUCCESS',
    page_size: page_size,
    offset: offset,
    result_size: data.length,
    data: finalData,
  }

  return request.loader.getAllCodespacesLoader
    .load(JSON.stringify(args))
    .then(() => mocked)
    .catch(() => mocked)
}
