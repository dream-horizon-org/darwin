import {Icons} from '../bit-components/icon/index'
import CatalogDrawer from '../components/dataCatalog/catalogDrawer'
import {featureFlags} from './featureFlags'

export const menu = {
  mlplatform: {
    menuName: '',
    badgeColor: '#118a27',
    menus: [
      {
        menuName: 'Compute',
        permission: 'everyone',
        link: '/clusters',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_MEMORY,
        iconUrl: '/icons/compute.svg',
        pushToBottom: false,
        component: null
      },
      {
        menuName: 'Feature Store',
        permission: 'everyone',
        link: '/store',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_LIGHTBULB,
        iconUrl: '/icons/feature-store.svg',
        pushToBottom: false,
        component: null
      },
      {
        menuName: 'Workspace',
        permission: 'everyone',
        link: '/workspace',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_LIBRARY_BOOKS,
        iconUrl: '/icons/workspace.svg',
        pushToBottom: false,
        component: null
      },
      {
        menuName: 'Workflows',
        permission: 'everyone',
        link: '/workflows',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_LIBRARY_BOOKS,
        iconUrl: '/icons/darwin_workflows.svg',
        pushToBottom: false,
        component: null
      },
      {
        menuName: 'Experiments',
        permission: 'everyone',
        link: '/experimentation',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_BOOK,
        iconUrl: '/icons/darwin-experiments.svg',
        pushToBottom: false,
        component: null
      },
      {
        menuName: 'Models',
        permission: 'everyone',
        link: '/models',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_BOOK,
        iconUrl: '/icons/darwin-models.svg',
        pushToBottom: false,
        component: null
      },
      // {
      //   menuName: 'Edge Models',
      //   permission: 'everyone',
      //   link: '/edge-models',
      //   skipGameId: true,
      //   noParent: true,
      //   icon: Icons.ICON_SHUFFLE,
      //   iconUrl: '/icons/darwin-edge-models.svg',
      //   pushToBottom: false,
      //   component: null
      // },
      {
        menuName: 'Data Catalog',
        permission: 'everyone',
        link: '/data-catalog',
        skipGameId: true,
        noParent: true,
        // icon: Icons.ICON_BOOK,
        iconUrl: '/icons/darwin-database-icon.svg',
        pushToBottom: false,
        component: CatalogDrawer
      },
      featureFlags.SETTINGS && {
        menuName: 'Settings',
        permission: 'everyone',
        link: '/settings',
        skipGameId: true,
        noParent: true,
        icon: Icons.ICON_SETTINGS,
        iconUrl: '/icons/darwin-settings.svg',
        pushToBottom: true,
        component: null
      }
    ]
  }
}
