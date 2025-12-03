import withStyles, {WithStyles} from '@mui/styles/withStyles'
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../bit-components/tags/tags-status/index'
import {SelectionOnAttachedCluster} from '../../modules/workspace/pages/graphqlApis/attachCluster/attachCluster'
import {GetClusterResources} from '../../modules/workspace/pages/graphqlApis/getClusterResources/getClusterResources'
import {API_STATUS} from '../../utils/apiUtils'
import styles from './indexJss'

const CONFLUENCE_DOC =
  'dream11.atlassian.net/wiki/spaces/DSSPL/pages/2845179915/Runtimes+in+Phase+1'
const HEAD_NODE_DOC =
  'https://sporta-technologies-private-limi.gitbook.io/darwin/AsBV8aJtrgybhZsDfvZh/key-concepts/compute/configurations#head-configurations'
const WORKER_NODE_DOC =
  'https://sporta-technologies-private-limi.gitbook.io/darwin/AsBV8aJtrgybhZsDfvZh/key-concepts/compute/configurations#worker-configurations'
const RUNTINE_DOC =
  'https://sporta-technologies-private-limi.gitbook.io/darwin/AsBV8aJtrgybhZsDfvZh/key-concepts/compute/runtimes'

const mapStateToProps = (state) => ({
  lastSelectedCodespace:
    state['workspaceProjectReducer']['lastSelectedCodespace']
})

const EnvironmentDetails = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Runtime environments are mapped to specific versions of core components
      (libraries etc.),<br></br>
      For more details on environments&nbsp;
      <a
        className={props.classes.genericToolTipLink}
        href={`${RUNTINE_DOC}`}
        target='_blank'
      >
        click here
      </a>
    </div>
  )
)

const HeadConfiguration = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Head pod manages all the ray processes & tasks.<br></br>
      For best practices & recommendations, read more&nbsp;
      <a
        className={props.classes.genericToolTipLink}
        href={HEAD_NODE_DOC}
        target='_blank'
      >
        here
      </a>
    </div>
  )
)

const WorkerConfiguration = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Each worker in a group has same specifications.<br></br>
      Autoscaling is enabled at a worker group level. Read more&nbsp;
      <a
        className={props.classes.genericToolTipLink}
        href={WORKER_NODE_DOC}
        target='_blank'
      >
        here
      </a>
    </div>
  )
)

const TemplateConfiguration = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Template decides the ratio of cores to memory in each worker group. Read
      more&nbsp;
      <a
        className={props.classes.genericToolTipLink}
        href={`https://${CONFLUENCE_DOC}`}
        target='_blank'
      >
        here
      </a>
    </div>
  )
)

const ResourceConfiguration = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Total Resources available for the cluster
    </div>
  )
)

const EstimatedCost = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      It is an approximate cost. Actual cost may vary.
    </div>
  )
)

const EnvironmentVariables = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Set the environment config for the cluster. These will override the
      default environment variables. Config can be related to system, spark, ray
      and any other frameworks
    </div>
  )
)

const ActiveCluster = withStyles(styles, {withTheme: true})(
  (
    props: {
      attachedCluster: SelectionOnAttachedCluster
      clusterResources: {
        status: API_STATUS
        data: GetClusterResources['getClusterResources']['data']
        error: any
      }
    } & WithStyles<typeof styles>
  ) => {
    const coresUsage =
      props.clusterResources.data?.cores_used ||
      props.attachedCluster?.cluster_usage?.cores_used
    const memoryUsage =
      props.clusterResources.data?.memory_used ||
      props.attachedCluster?.cluster_usage?.memory_used

    const showUsage = true
    return (
      <div className={props.classes.genericToolTip}>
        <div className={props.classes.flex}>
          <div>{props.attachedCluster?.cluster_name}</div>
          <div className={props.classes.ml16}>
            <TagsStatus status={TagsStatusTypes.Active} />
          </div>
        </div>
        {showUsage ? (
          <div className={props.classes.mt8}>
            <div className={props.classes.label}>Usage</div>
            <div className={props.classes.flex}>
              <div>CPU: {coresUsage}%;</div>
              <div>Memory: {memoryUsage}%</div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }
)

export const AttachCluster = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>Attach a Cluster</div>
  )
)

export const ActivatingCluster = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>Activating the Cluster</div>
  )
)

const LogPath = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      All the logs of this cluster will be logged in<br></br>
      this s3 location for future debugging
    </div>
  )
)

const InitScripts = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      This is the shell script which will run<br></br>
      at cluster start
    </div>
  )
)

const InstanceRole = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Instance role will provide all the cloud accesses<br></br>
      (mainly for data sources) for the cluster
    </div>
  )
)

const ObjectStoreMemory = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      The percentage of memory to start object store with
    </div>
  )
)

const CPUOnHead = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Number of CPU’s on head to be used by ray for workloads
    </div>
  )
)

const TaskSource = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>Sources of the task.</div>
  )
)

const WorkspacePath = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Workspace Path pointing to the source code.
    </div>
  )
)

const GitRepo = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Git repo url pointing to the source code.
    </div>
  )
)

const FilePath = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Relative path from the repo root folder without slash (/).
    </div>
  )
)

const DynamicUpdateSourceFiles = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Files will be picked up at the time of execution.
    </div>
  )
)

const DependentLibraries = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Install command for dependent libraries.
    </div>
  )
)

const DependsOn = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>List of dependent Tasks.</div>
  )
)

const WorkflowParameters = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Input parameters for the task.
    </div>
  )
)

const WorkflowTaskRetries = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Number of retries available for the task.
    </div>
  )
)

const WorkflowDetails = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Name, description, and Tags of the workflow.
    </div>
  )
)

const Schedule = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Schedule for workflow runs.
    </div>
  )
)

const Concurrency = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Maximum runs to be executed simultaneously.
    </div>
  )
)

const WorkflowGlobalParameters = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Input parameters for the workflow which will be added to all tasks in the
      workflow.
    </div>
  )
)

const Queue = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Enable this option to queue runs for sequential processing.
    </div>
  )
)

const MaxConcurrentWorkflows = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Maximum instances of the workflow at a time.
    </div>
  )
)

const HighAvailabilityTask = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Selecting will attach multiple clusters to the task.
    </div>
  )
)

const RetriesForWorkflow = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Number of retries for the workflow.
    </div>
  )
)

const SlackNotificationForWorkflow = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Slack channel for workflow-related notifications.
    </div>
  )
)

const SlackNotificationForTask = withStyles(styles, {withTheme: true})(
  (props: WithStyles<typeof styles>) => (
    <div className={props.classes.genericToolTip}>
      Slack channel for task-related notifications.
    </div>
  )
)
export const predefinedToolTips = {
  environmentDetails: <EnvironmentDetails />,
  headConfiguration: <HeadConfiguration />,
  workerConfiguration: <WorkerConfiguration />,
  templateConfiguration: <TemplateConfiguration />,
  resourceConfiguration: <ResourceConfiguration />,
  environmentVariables: <EnvironmentVariables />,
  activeCluster: (props) => <ActiveCluster {...props} />,
  attachCluster: <AttachCluster />,
  activatingCluster: <ActivatingCluster />,
  logPath: <LogPath />,
  initScripts: <InitScripts />,
  instanceRole: <InstanceRole />,
  objectStoreMemory: <ObjectStoreMemory />,
  cpuOnHead: <CPUOnHead />,
  taskSource: <TaskSource />,
  dynamicUpdateSourceFiles: <DynamicUpdateSourceFiles />,
  workspacePath: <WorkspacePath />,
  gitRepo: <GitRepo />,
  filePath: <FilePath />,
  dependentLibraries: <DependentLibraries />,
  dependsOn: <DependsOn />,
  workflowParameters: <WorkflowParameters />,
  workflowGlobalParameters: <WorkflowGlobalParameters />,
  workflowTaskRetries: <WorkflowTaskRetries />,
  WorkflowDetails: <WorkflowDetails />,
  schedule: <Schedule />,
  concurrency: <Concurrency />,
  queue: <Queue />,
  maxConcurrentWorkflows: <MaxConcurrentWorkflows />,
  highAvailabilityTask: <HighAvailabilityTask />,
  retriesForWorkflow: <RetriesForWorkflow />,
  slackNotificationForWorkflow: <SlackNotificationForWorkflow />,
  slackNotificationForTask: <SlackNotificationForTask />,
  EstimatedCost: <EstimatedCost />
}
