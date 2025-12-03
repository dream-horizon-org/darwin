import {addRecentlyVisitedClusterResolver} from './src/addRecentlyVisited/addRecentlyVisited.resolver'
import {getEventTypesResolver} from './src/getEventTypes/getEventTypes.resolver'
import {getFilterOptionsResolver} from './src/getFilterOptions/getFilterOptions.resolver'
import {getLogComponentsResolver} from './src/getLogComponents/getLogComponents.resolver'
import {getLogGroupsResolver} from './src/getLogGroups/getLogGroups.resolver'
import {getLogLevelsResolver} from './src/getLogLevels/getLogLevels.resolver'
import {getLogLineDetailsResolver} from './src/getLogLineDetails/getLogLineDetails.resolver'
import {getLogsResolver} from './src/getLogs/getLogs.resolver'
import {getRecentlyCisitedClustersResolver} from './src/getRecentlyVisitedClusters/getRecentlyVisitedClusters.resolver'
import {getSearchedClustersResolver} from './src/getSearchedClusters/getSearchedClusters.resolver'

import {getSparkHistoryServerResolver} from './src/getSparkHistoryServer/getSparkHistoryServer.resolver'
import {startSparkHistoryServerResolver} from './src/startSparkHistoryServer/startSparkHistoryServer.resolver'
export const queries = {
  getRecentlyVisitedClusters: getRecentlyCisitedClustersResolver,
  getFilterOptions: getFilterOptionsResolver,
  getEventTypes: getEventTypesResolver,
  getSearchedClusters: getSearchedClustersResolver,
  getLogGroups: getLogGroupsResolver,
  getLogLevels: getLogLevelsResolver,
  getLogComponents: getLogComponentsResolver,
  getLogs: getLogsResolver,
  getLogLineDetails: getLogLineDetailsResolver,
  getSparkHistoryServer: getSparkHistoryServerResolver,
}
export const mutations = {
  addRecentlyVisitedCluster: addRecentlyVisitedClusterResolver,
  startSparkHistoryServer: startSparkHistoryServerResolver,
}
