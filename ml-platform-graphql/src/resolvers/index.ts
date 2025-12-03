import {attachCluster} from './attachCluster'
import {checkUniqueCodespaceName} from './checkUniqueCodespaceName'
import {checkUniqueGithubLink} from './checkUniqueGithubLink'
import {checkUniqueProjectName} from './checkUniqueProjectName'
import {createCodespace} from './createCodespace'
import {createComputeCluster} from './createComputeCluster'
import {createProject} from './createProject'
import {detachCluster} from './detachCluster'
// import {fetchAllFeatureJobs} from './fetchAllFeatureJobs' // Not in schema - removed
import {fetchAllFilters} from './fetchAllFilters'
import {fetchComputeTags} from './fetchComputeTags'
import {fetchCountOfJobs} from './fetchCountOfJobs'
import {fetchFeatureGroup} from './fetchFeatureGroup'
// import {fetchFeatureJob} from './fetchFeatureJob' // Not in schema - removed
import {fetchFeatureJobsById} from './fetchFeatureJobsById'
import {fetchFilteredFeatureGroups} from './fetchFilteredFeatureGroups'
import {fetchScheduleJobRuns} from './fetchScheduleJobRuns'
import {getCountOfProjects} from './getCountOfProjects'
import {getFeatureGroupDetails} from './getFeatureGroupDetails'
import {getFeatureGroupEntities} from './getFeatureGroupEntities'
import {getFeatureGroupFilters} from './getFeatureGroupFilters'
import {getFeatureGroupsCount} from './getFeatureGroupsCount'
import {getLastSelectedCodespace} from './getLastSelectedCodespace'
import {getLastSyncedTime} from './getLastSyncedTime'
import {importProject} from './importProject'
import {predictClusterCost} from './predictClusterCost'
import {searchComputeClusters} from './searchComputeClusters'
import {getRecentlyVisitedWorkflows} from './workflows/getRecentlyVisitedWorkflows'
import {getWorkflowDetails} from './workflows/getWorkflowDetails'
import {getWorkflowFilters} from './workflows/getWorkflowFilters'
import {getWorkflowPathDetails} from './workflows/getWorkflowPathDetails'
import {getWorkflowRunCode} from './workflows/getWorkflowRunCode'
import {getWorkflowRunDetails} from './workflows/getWorkflowRunDetails'
import {getWorkflowRuns} from './workflows/getWorkflowRuns'
import {getWorkflows} from './workflows/getWorkflows'
import {getWorkflowTaskDetails} from './workflows/getWorkflowTaskDetails'
import {getWorkflowTaskDetailsWithoutRun} from './workflows/getWorkflowTaskDetailsWithoutRun'

import {
  mutations as bringYourOwnRuntimeMutations,
  queries as bringYourOwnRuntimeQueries,
} from './bring-your-own-runtime'
import {
  mutations as computeMutations,
  queries as computeQueries,
} from './compute'
import {createFeatureGroup} from './createFeatureGroup'
import {createJobClusterDefinition} from './createJobClusterDefinition'
import {deleteCluster} from './deleteCluster'
import {deleteCodespace} from './deleteCodespace'
import {deleteProject} from './deleteProject'
import {editCodespace} from './editCodespace'
import {editProject} from './editProject'
import {fetchFeatureGroupVersions} from './fetchFeatureGroupVersions'
import {getActionGroupDetails} from './getActionGroupDetails'
import {getActionGroups} from './getActionGroups'
import {getAllClusters} from './getAllClusters'
import {getAllJobClusters} from './getAllJobClusters'
import {getClusterResources} from './getClusterResources'
import {getCodespaces} from './getCodespaces'
import {getComputeAvailabilityZones} from './getComputeAvailabilityZones'
import {getComputeCluster} from './getComputeCluster'
import {getComputeDiscTypes} from './getComputeDiscTypes'
import {getComputeGpuPods} from './getComputeGpuPods'
import {getComputeInstanceRoles} from './getComputeInstanceRoles'
import {getComputeLimits} from './getComputeLimits'
import {getComputeNodeTypes} from './getComputeNodeTypes'
import {getComputeRuntimeList} from './getComputeRuntimeList'
import {getComputeTemplates} from './getComputeTemplates'
import {getDatabasesForEnvironmentAndSource} from './getDatabasesForEnvironmentAndSource'
import {getDataForEnvironmentAndSource} from './getDataForEnvironmentAndSource'
import {getDataSourceEnvironments} from './getDataSourceEnvironments'
import {getDataSourceSourcesForEnvironment} from './getDataSourceSourcesForEnvironment'
import {getFeatureCopyCodes} from './getFeatureCopyCodes'
import {getFeatureGroupRuns} from './getFeatureGroupRuns'
import {getFeatureGroups} from './getFeatureGroups'
import {getFeatures} from './getFeatures'
import {getProjects} from './getProjects'
import {getSampleDataForDataSource} from './getSampleDataForDataSource'
import {jobClusterDefinition} from './jobClusterDefinition'
import {launchCodespace} from './launchCodespace'
import {launchImportedProject} from './launchImportedProject'
import {reStartCluster} from './restartCluster'
import {startCluster} from './startCluster'
import {stopCluster} from './stopCluster'
import {toggleFeatureJobState} from './toggleFeatureJobState'
import {updateComputeCluster} from './updateComputeCluster'
import {updateComputeClusterName} from './updateComputeClusterName'
import {updateComputeClusterTags} from './updateComputeClusterTags'
import {updateFeatureJob} from './updateFeatureJob'
import {updateJobClusterDefinition} from './updateJobClusterDefinition'
import {checkUniqueJobClusterName} from './workflows/checkUniqueJobClusterName'
import {checkUniqueWorkflow} from './workflows/checkUniqueWorkflow'
import {codespaceFolders} from './workflows/codespaceFolders'
import {createWorkflow} from './workflows/createWorkflow'
import {deleteWorkflow} from './workflows/deleteWorkflow'
import {getWorkflowYaml} from './workflows/getWorkflowYaml'
import {pauseWorkflowSchedule} from './workflows/pauseWorkflowSchedule'
import {resumeWorkflowSchedule} from './workflows/resumeWorkflowSchedule'
import {runWorkflowRun} from './workflows/runWorkflowRun'
import {stopWorkflowRun} from './workflows/stopWorkflowRun'
import {updateWorkflow} from './workflows/updateWorkflow'
import {updateWorkflowMaxConcurrentRuns} from './workflows/updateWorkflowMaxConcurrentRuns'
import {updateWorkflowRetries} from './workflows/updateWorkflowRetries'
import {updateWorkflowSchedule} from './workflows/updateWorkflowSchedule'
import {updateWorkflowTags} from './workflows/updateWorkflowTags'
import {workspaces} from './workflows/workspaces'

import {createExperimentationUser} from './experimentation/createExperimentationUser'
import {repairWorkflowRun} from './workflows/repairWorkflowRun'
import {
  mutations as workspaceMutations,
  queries as workspaceQueries,
} from './workspace'

import {getCatalogAssets} from './catalog/getCatalogAssets'
import {searchAssets} from './catalog/searchAssets'
import {deleteJobClusterDefinition} from './deleteJobClusterDefinition'
import {getAllJobClustersV2} from './getAllJobClustersV2'
import {getComputeLibraries} from './getComputeLibraries'
import {getComputeLibraryDetails} from './getComputeLibraryDetails'
import {getComputeLibraryStatus} from './getComputeLibraryStatus'
import {getComputeLibraryStatuses} from './getComputeLibraryStatuses'
import {getComputeRuntime} from './getComputeRuntime'
import {getComputeRuntimeDetails} from './getComputeRuntimeDetails'
import {getLineageAsset} from './getLineageAsset'
import {getMavenPackages} from './getMavenPackages'
import {getMavenPackageVersions} from './getMavenPackageVersions'
import {installLibrary} from './installLibrary'
import {
  mutations as modelDeploymentsMutations,
  queries as modelDeploymentsQueries,
} from './model-deployments'
import {retryInstallLibrary} from './retryInstallLibrary'
import {uninstallLibrary} from './uninstallLibrary'
import {getAllPurposeClusters} from './workflows/getAllPurposeClusters'
import {getWorkflowsAttachedToCluster} from './workflows/getWorkflowsAttachedToCluster'
import {getWorkflowsMetaData} from './workflows/getWorkflowsMetaData'

export const queries = {
  // fetchAllFeatureJobs, // Not in schema - removed
  fetchAllFilters,
  fetchCountOfJobs,
  fetchFilteredFeatureGroups,
  fetchFeatureJobsById: fetchFeatureJobsById,
  // fetchFeatureJob: fetchFeatureJob, // Not in schema - removed
  fetchScheduleJobRuns: fetchScheduleJobRuns,
  fetchFeatureGroup,
  fetchFeatureGroupVersions,
  fetchComputeTags,
  searchComputeClusters,
  getComputeCluster,
  getComputeRuntimeList,
  getComputeRuntime,
  getComputeRuntimeDetails,
  getComputeTemplates,
  getComputeDiscTypes,
  getComputeInstanceRoles,
  getComputeAvailabilityZones,
  getActionGroups,
  getActionGroupDetails,
  getProjects,
  getCodespaces,
  checkUniqueProject: checkUniqueProjectName,
  checkUniqueLink: checkUniqueGithubLink,
  checkUniqueCodespace: checkUniqueCodespaceName,
  getLastSelectedCodespace,
  getLastSyncedTimeForCodespace: getLastSyncedTime,
  launchCodespace,
  importProject,
  getAllClusters,
  getAllJobClusters,
  getAllJobClustersV2,
  launchImportedProject,
  getComputeLimits,
  getFeatureGroups,
  getFeatures,
  getFeatureGroupFilters,
  getFeatureGroupDetails,
  getDataSourceEnvironments,
  getDataSourceSourcesForEnvironment,
  getDataForEnvironmentAndSource,
  getDatabasesForEnvironmentAndSource,
  getSampleDataForDataSource,
  getClusterResources,
  getCountOfProjects,
  getFeatureCopyCodes,
  getFeatureGroupEntities,
  getFeatureGroupRuns,
  getFeatureGroupsCount,
  getComputeNodeTypes,
  getComputeGpuPods,
  getComputeLibraries,
  getComputeLibraryDetails,
  getComputeLibraryStatus,
  getComputeLibraryStatuses,
  getMavenPackageVersions,
  installLibrary,
  getMavenPackages,
  getRecentlyVisitedWorkflows,
  getWorkflows,
  getWorkflowFilters,
  getWorkflowDetails,
  getWorkflowsMetaData,
  getWorkflowPathDetails,
  getWorkflowRuns,
  getWorkflowRunDetails,
  getWorkflowRunCode,
  getWorkflowTaskDetails,
  getWorkflowTaskDetailsWithoutRun,
  ...computeQueries,
  checkUniqueWorkflow,
  workspaces,
  codespaceFolders,
  jobClusterDefinition,
  checkUniqueJobClusterName,
  ...bringYourOwnRuntimeQueries,
  ...workspaceQueries,
  ...modelDeploymentsQueries,
  getCatalogAssets,
  searchAssets,
  getAllPurposeClusters,
  getWorkflowsAttachedToCluster,
  getLineageAsset,
}

export const mutations = {
  createFeatureGroup,
  updateFeatureJob,
  toggleFeatureJobState,
  createComputeCluster,
  predictClusterCost,
  updateComputeCluster,
  updateComputeClusterName,
  updateComputeClusterTags,
  stopCluster,
  deleteCluster,
  deleteJobClusterDefinition,
  startCluster,
  reStartCluster,
  detachCluster,
  createProject,
  attachCluster,
  createCodespace,
  deleteProject,
  deleteCodespace,
  editCodespace,
  uninstallLibrary,
  editProject,
  pauseWorkflowSchedule,
  deleteWorkflow,
  resumeWorkflowSchedule,
  runWorkflowRun,
  stopWorkflowRun,
  createWorkflow,
  updateWorkflow,
  createJobClusterDefinition,
  updateJobClusterDefinition,
  updateWorkflowRetries,
  updateWorkflowMaxConcurrentRuns,
  updateWorkflowSchedule,
  updateWorkflowTags,
  getWorkflowYaml,
  retryInstallLibrary,
  ...computeMutations,
  ...workspaceMutations,
  ...bringYourOwnRuntimeMutations,
  createExperimentationUser,
  repairWorkflowRun,
  ...modelDeploymentsMutations,
}
