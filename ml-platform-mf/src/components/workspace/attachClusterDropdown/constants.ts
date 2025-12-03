import {API_STATUS} from '../../../utils/apiUtils'
import {IClusterList} from './attachClusterDropdown'

export const clusterList: Array<IClusterList> = [
  {
    id: 'id_1',
    name: 'Cluster 1',
    label: 'Cluster 1',
    core: 4,
    memory: 512,
    status: 'active',
    link: '/id_1212212'
  },
  {
    id: 'id_1',
    name: 'Cluster for personalisation',
    label: 'Cluster for personalisation',
    core: 4,
    memory: 512,
    status: 'active',
    link: '/id_1212212'
  },
  {
    id: 'id_1',
    name: 'Ds_personlisation_abhinav',
    label: 'Ds_personlisation_abhinav',
    core: 4,
    memory: 512,
    status: 'active',
    link: '/id_1212212'
  },
  {
    id: 'id_1',
    name: 'Cluster 4',
    label: 'Cluster 4',
    core: 4,
    memory: 512,
    status: 'active',
    link: '/id_1212212'
  },
  {
    id: 'id_1',
    name: 'Cluster 5',
    label: 'Cluster 5',
    core: 4,
    memory: 512,
    status: 'active',
    link: '/id_1212212'
  },
  {
    id: 'id_1',
    name: 'action',
    label: 'Cluster 5',
    core: 4,
    memory: 512,
    status: 'active',
    link: '/id_1212212'
  }
]

export const clearPayload = {
  status: API_STATUS.INIT,
  data: null,
  error: null,
  pageSize: null,
  offset: null,
  resultSize: null
}
