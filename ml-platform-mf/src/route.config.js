"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var asyncComponent_1 = __importDefault(require("./utils/asyncComponent"));
// order in the routes matters
var routes = [
    {
        exact: true,
        path: ['/'],
        key: 'baseroute',
        permissions: 'everyone',
        component: (0, asyncComponent_1.default)(function () {
            return Promise.resolve().then(function () { return __importStar(require(
            /* webpackChunkName: 'baseRoute' */ './components/baseRoute/baseRoute')); });
        })
    },
    {
        exact: true,
        path: [constants_1.routes.welecomePage],
        permissions: 'everyone',
        key: 'home',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/welcome/welcome')); }); }, {
            key: 'home',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.featureJobsListingPage],
        permissions: 'everyone',
        key: 'home',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/featureStore')); }); }, {
            key: 'home',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.clusterCreatePage],
        permissions: 'everyone',
        key: 'home',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/compute/pages/computeCreate/computeCreate')); }); }, {
            key: 'home',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.clusterDetailsPage],
        permissions: 'everyone',
        key: 'home',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/compute/pages/computeDetails/computeDetails')); }); }, {
            key: 'home',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.clusterEditPage],
        permissions: 'everyone',
        key: 'home',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/compute/pages/computeEdit/computeEdit')); }); }, {
            key: 'home',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: ['/features/:featureGroupName/:version/details'],
        permissions: 'everyone',
        key: 'createFeatureGroup',
        component: (0, asyncComponent_1.default)(function () {
            return Promise.resolve().then(function () { return __importStar(require('./modules/featureStore/pages/featureJobDetails/featureDetails')); });
        }, { key: 'createFeatureGroup', stage: 'RQ' })
    },
    {
        exact: true,
        path: [constants_1.routes.compute],
        permissions: 'everyone',
        key: 'home',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/compute')); }); }, {
            key: 'compute',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.sharedWorkspace],
        permissions: 'everyone',
        key: 'workspace',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/workspace/pages/project/project')); }); }, {
            key: 'workspace',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.workspace],
        permissions: 'everyone',
        key: 'workspace',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/workspace/pages/project/project')); }); }, {
            key: 'workspace',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.featureGroupList],
        permissions: 'everyone',
        key: 'featureGroupList',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/featureStoreV2/pages/featureStoreGroups')); }); }, {
            key: 'featureGroupList',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.feature],
        permissions: 'everyone',
        key: 'featureList',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/featureStoreV2/pages/featureStoreGroupDetails')); }); }, {
            key: 'featureList',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.workflows],
        permissions: 'everyone',
        key: 'workflows',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/workflows/pages/workflows')); }); }, {
            key: 'workflows',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.editWorkflow],
        permissions: 'everyone',
        key: 'workflowCreate',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/workflows/pages/workflowEdit')); }); }, {
            key: 'workflowEdit',
            stage: 'RQ'
        })
    },
    {
        exact: false,
        path: [constants_1.routes.workflowDetails],
        permissions: 'everyone',
        key: 'workflowDetails',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/workflows/pages/workflowDetails')); }); }, {
            key: 'workflowDetails',
            stage: 'RQ'
        })
    },
    {
        exact: false,
        path: [constants_1.routes.experiments],
        permissions: 'everyone',
        key: 'experiments',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/experiments/pages/Homepage')); }); }, {
            key: 'experiments',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.edgeModels],
        permissions: 'everyone',
        key: 'edgeModels',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/edgeModels/pages/list')); }); }, {
            key: 'edgeModels',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.edgeModelCreate],
        permissions: 'everyone',
        key: 'edgeModelsCreate',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/edgeModels/pages/create')); }); }, {
            key: 'edgeModelsCreate',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.edgeModelDetails],
        permissions: 'everyone',
        key: 'edgeModelsDetails',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/edgeModels/pages/info')); }); }, {
            key: 'edgeModelsCreate',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.edgeModelEdit],
        permissions: 'everyone',
        key: 'edgeModelEdit',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/edgeModels/pages/edit')); }); }, {
            key: 'edgeModelEdit',
            stage: 'RQ'
        })
    },
    {
        exact: false,
        path: [constants_1.routes.models],
        permissions: 'everyone',
        key: 'models',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/models/pages/Homepage')); }); }, {
            key: 'models',
            stage: 'RQ'
        })
    },
    {
        exact: false,
        path: [constants_1.routes.settings],
        permissions: 'everyone',
        key: 'settings',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/settings')); }); }, {
            key: 'settings',
            stage: 'RQ'
        })
    },
    {
        exact: true,
        path: [constants_1.routes.createWorkflow],
        permissions: 'everyone',
        key: 'workflowCreate',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./modules/workflows/pages/workflowCreate')); }); }, {
            key: 'workflowCreate',
            stage: 'RQ'
        })
    },
    {
        path: '*',
        key: 'notfound',
        permissions: 'everyone',
        component: (0, asyncComponent_1.default)(function () { return Promise.resolve().then(function () { return __importStar(require('./components/notFound/NotFound')); }); })
    }
];
exports.default = routes;
