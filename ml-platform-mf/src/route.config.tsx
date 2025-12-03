import config from 'config'
import {routes as routesPath} from './constants'
import AsyncComponent from './utils/asyncComponent'

// order in the routes matters
const routes = [
  {
    exact: true,
    path: ['/'],
    key: 'baseroute',
    permissions: 'everyone',
    component: AsyncComponent(
      () =>
        import(
          /* webpackChunkName: 'baseRoute' */ './components/baseRoute/baseRoute'
        )
    )
  },
  {
    exact: true,
    path: [routesPath.welecomePage],
    permissions: 'everyone',
    key: 'home',
    component: AsyncComponent(() => import('./modules/welcome/welcome'), {
      key: 'home',
      stage: 'RQ'
    })
  },
  {
    exact: true,
    path: [routesPath.featureJobsListingPage],
    permissions: 'everyone',
    key: 'home',
    component: AsyncComponent(() => import('./modules/featureStore'), {
      key: 'home',
      stage: 'RQ'
    })
  },
  {
    exact: true,
    path: [routesPath.clusterCreatePage],
    permissions: 'everyone',
    key: 'home',
    component: AsyncComponent(
      () => import('./modules/compute/pages/computeCreate/computeCreate'),
      {
        key: 'home',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.clusterDetailsPage],
    permissions: 'everyone',
    key: 'home',
    component: AsyncComponent(
      () => import('./modules/compute/pages/computeDetails/computeDetails'),
      {
        key: 'home',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.clusterEditPage],
    permissions: 'everyone',
    key: 'home',
    component: AsyncComponent(
      () => import('./modules/compute/pages/computeEdit/computeEdit'),
      {
        key: 'home',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: ['/features/:featureGroupName/:version/details'],
    permissions: 'everyone',
    key: 'createFeatureGroup',
    component: AsyncComponent(
      () =>
        import('./modules/featureStore/pages/featureJobDetails/featureDetails'),
      {key: 'createFeatureGroup', stage: 'RQ'}
    )
  },
  {
    exact: true,
    path: [routesPath.compute],
    permissions: 'everyone',
    key: 'home',
    component: AsyncComponent(() => import('./modules/compute'), {
      key: 'compute',
      stage: 'RQ'
    })
  },
  {
    exact: true,
    path: [routesPath.sharedWorkspace],
    permissions: 'everyone',
    key: 'workspace',
    component: AsyncComponent(
      () => import('./modules/workspace/pages/project/project'),
      {
        key: 'workspace',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.workspace],
    permissions: 'everyone',
    key: 'workspace',
    component: AsyncComponent(
      () => import('./modules/workspace/pages/project/project'),
      {
        key: 'workspace',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.featureGroupList],
    permissions: 'everyone',
    key: 'featureGroupList',
    component: AsyncComponent(
      () => import('./modules/featureStoreV2/pages/featureStoreGroups'),
      {
        key: 'featureGroupList',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.feature],
    permissions: 'everyone',
    key: 'featureList',
    component: AsyncComponent(
      () => import('./modules/featureStoreV2/pages/featureStoreGroupDetails'),
      {
        key: 'featureList',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.workflows],
    permissions: 'everyone',
    key: 'workflows',
    component: AsyncComponent(
      () => import('./modules/workflows/pages/workflows'),
      {
        key: 'workflows',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.editWorkflow],
    permissions: 'everyone',
    key: 'workflowCreate',
    component: AsyncComponent(
      () => import('./modules/workflows/pages/workflowEdit'),
      {
        key: 'workflowEdit',
        stage: 'RQ'
      }
    )
  },
  {
    exact: false,
    path: [routesPath.workflowDetails],
    permissions: 'everyone',
    key: 'workflowDetails',
    component: AsyncComponent(
      () => import('./modules/workflows/pages/workflowDetails'),
      {
        key: 'workflowDetails',
        stage: 'RQ'
      }
    )
  },
  {
    exact: false,
    path: [routesPath.experiments],
    permissions: 'everyone',
    key: 'experiments',
    component: AsyncComponent(
      () => import('./modules/experiments/pages/Homepage'),
      {
        key: 'experiments',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.edgeModels],
    permissions: 'everyone',
    key: 'edgeModels',
    component: AsyncComponent(() => import('./modules/edgeModels/pages/list'), {
      key: 'edgeModels',
      stage: 'RQ'
    })
  },
  {
    exact: true,
    path: [routesPath.edgeModelCreate],
    permissions: 'everyone',
    key: 'edgeModelsCreate',
    component: AsyncComponent(
      () => import('./modules/edgeModels/pages/create'),
      {
        key: 'edgeModelsCreate',
        stage: 'RQ'
      }
    )
  },
  {
    exact: true,
    path: [routesPath.edgeModelDetails],
    permissions: 'everyone',
    key: 'edgeModelsDetails',
    component: AsyncComponent(() => import('./modules/edgeModels/pages/info'), {
      key: 'edgeModelsCreate',
      stage: 'RQ'
    })
  },
  {
    exact: true,
    path: [routesPath.edgeModelEdit],
    permissions: 'everyone',
    key: 'edgeModelEdit',
    component: AsyncComponent(() => import('./modules/edgeModels/pages/edit'), {
      key: 'edgeModelEdit',
      stage: 'RQ'
    })
  },
  {
    exact: false,
    path: [routesPath.models],
    permissions: 'everyone',
    key: 'models',
    component: AsyncComponent(() => import('./modules/models/pages/Homepage'), {
      key: 'models',
      stage: 'RQ'
    })
  },
  {
    exact: false,
    path: [routesPath.settings],
    permissions: 'everyone',
    key: 'settings',
    component: AsyncComponent(() => import('./modules/settings'), {
      key: 'settings',
      stage: 'RQ'
    })
  },
  {
    exact: true,
    path: [routesPath.createWorkflow],
    permissions: 'everyone',
    key: 'workflowCreate',
    component: AsyncComponent(
      () => import('./modules/workflows/pages/workflowCreate'),
      {
        key: 'workflowCreate',
        stage: 'RQ'
      }
    )
  },
  {
    path: '*',
    key: 'notfound',
    permissions: 'everyone',
    component: AsyncComponent(() => import('./components/notFound/NotFound'))
  }
]

export default routes
