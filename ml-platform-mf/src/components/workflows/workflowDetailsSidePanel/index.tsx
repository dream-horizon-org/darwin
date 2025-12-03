import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import React from 'react'
import {
  Tags,
  TagsSizes,
  TagsType
} from '../../../bit-components/tags/tags/index'

import {
  Button,
  ButtonSizes,
  ButtonTypes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {routes} from '../../../constants'
import {SelectionOnAttachedCluster} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {
  getTagsType,
  onClusterLinkClicked
} from '../../../modules/workflows/pages/workflows/utils'
import {aliasTokens} from '../../../theme.contants'
import {truncate} from '../../../utils/helper'
import {NOTIFICATION_ON} from '../allWorkflows/constant'
import {getFormattedDateTime} from '../allWorkflows/utils'
import TimeExceededIcon from '../timeExceededIcon'
import UpdateMaxRuns from '../updateMaxRuns'
import UpdateRetries from '../updateRetries'
import WorkflowParameterListing from '../workflowParameterListing'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setShowSidePanel: (a: boolean) => void
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
}

const WorkflowDetailsSidePanel = (props: IProps) => {
  const {classes, setShowSidePanel, workflowDetails} = props
  const [showAllClusters, setShowAllClusters] = React.useState(false)
  const [showUpdateMaxRuns, setShowUpdateMaxRuns] = React.useState(false)
  const [showUpdateRetries, setShowUpdateRetries] = React.useState(false)

  const allClusters: SelectionOnAttachedCluster[] = Object.values(
    workflowDetails?.data?.tasks.reduce((acc, curr) => {
      if (!curr.attached_cluster) return acc

      acc[curr.attached_cluster.cluster_id] = curr.attached_cluster
      return acc
    }, {}) || {}
  )

  const onShowAllClicked = () => {
    setShowAllClusters(!showAllClusters)
  }

  const getItemsToShowForCluster = () => {
    if (!allClusters || allClusters.length === 0) {
      return []
    }

    if (showAllClusters) {
      return allClusters
    } else {
      return allClusters.slice(0, 1)
    }
  }

  const onCloseUpdateMaxRuns = () => {
    setShowUpdateMaxRuns(false)
  }

  const onCloseUpdateRetries = () => {
    setShowUpdateRetries(false)
  }

  return (
    <div className={classes.container}>
      <div
        className={classes.collapseIconContainer}
        onClick={() => setShowSidePanel(false)}
        data-testid='side-panel-collapse-button'
      >
        <KeyboardArrowRightIcon className={classes.collapseIcon} />
      </div>
      <div className={classes.title}>Workflow Details</div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Workflow ID</div>
        <div
          className={`${classes.workflowDetailsDescription}`}
          data-testid='workflow-details-page-workflow-id'
        >
          {workflowDetails?.data?.workflow_id}
        </div>
      </div>
      {/* <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Git</div>
        {workflowDetails?.data?.git_link ? (
          <div
            className={`${classes.workflowDetailsDescription} ${classes.underline}`}
          >
            Link
          </div>
        ) : (
          <div className={`${classes.workflowDetailsDescription}`}>
            Not Configured
          </div>
        )}
      </div> */}
      <hr className={classes.line} />
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>
          <div className={classes.left}>Cluster ({allClusters.length})</div>
          {allClusters.length > 1 && (
            <div className={classes.right} onClick={onShowAllClicked}>
              {showAllClusters ? 'Show less' : 'Show all'}
            </div>
          )}
        </div>
        {getItemsToShowForCluster().map((cluster) => (
          <div className={classes.clusterContainer}>
            <div className={classes.clusterTitleContainer}>
              <div className={classes.left}>
                <div
                  className={
                    cluster?.cluster_status ? classes.clusterTitle : ''
                  }
                  onClick={() => {
                    if (cluster?.cluster_status)
                      onClusterLinkClicked('dashboard', cluster.cluster_id)
                  }}
                >
                  {cluster.cluster_name}
                </div>
                {cluster?.cluster_status && (
                  <OpenInNewIcon
                    onClick={() =>
                      onClusterLinkClicked('dashboard', cluster.cluster_id)
                    }
                    className={classes.openInNewTabIcon}
                  />
                )}
                {cluster?.cluster_status && (
                  <span className={classes.tag}>
                    <Tags
                      label={cluster.cluster_status}
                      type={getTagsType(cluster.cluster_status)}
                      size={TagsSizes.Small}
                    />
                  </span>
                )}
              </div>
              {/* <LinkOffIcon className={classes.openInNewTabIcon} /> */}
            </div>
            <div className={classes.clusterInfo}>
              {cluster.cores} Core / {cluster.memory} GB
            </div>
            <div className={classes.clusterInfo}>{cluster.runtime}</div>
            {cluster?.cluster_status && (
              <div className={classes.dashboards}>
                <div
                  className={classes.dashboard}
                  onClick={() =>
                    onClusterLinkClicked('events', cluster.cluster_id)
                  }
                >
                  <span>Events</span>
                  <OpenInNewIcon className={classes.openInNewTabIcon} />
                </div>
                <div
                  className={classes.dashboard}
                  onClick={() =>
                    onClusterLinkClicked('dashboard', cluster.cluster_id)
                  }
                >
                  <span>Dashboard</span>
                  <OpenInNewIcon className={classes.openInNewTabIcon} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <hr className={classes.line} />
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Max Concurrent Runs</div>
        <div
          className={classes.workflowDetailsDescription}
          data-testid='max-concurrent-run-heading'
        >
          {workflowDetails?.data?.max_concurrent_runs ? (
            workflowDetails?.data?.max_concurrent_runs
          ) : (
            <span data-testid='add-max-concurrent-run-button'>
              <Button
                buttonText={'ADD'}
                onClick={() => setShowUpdateMaxRuns(true)}
                variant={ButtonVariants.SECONDARY}
                size={ButtonSizes.SMALL}
              />
            </span>
          )}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>No. of Retries</div>
        <div
          className={classes.workflowDetailsDescription}
          data-testid='no-of-retries-for-workflow'
        >
          {workflowDetails?.data?.retries ? (
            workflowDetails?.data?.retries
          ) : (
            <span data-testid='add-no-of-retries-button'>
              <Button
                buttonText={'ADD'}
                onClick={() => setShowUpdateRetries(true)}
                variant={ButtonVariants.SECONDARY}
                size={ButtonSizes.SMALL}
              />
            </span>
          )}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Queued?</div>
        <div className={classes.workflowDetailsDescription}>
          {workflowDetails?.data?.queue_enabled ? (
            <span>Yes</span>
          ) : (
            <span>No</span>
          )}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>
          High Availability Task
        </div>
        <div className={classes.workflowDetailsDescription}>
          {workflowDetails?.data?.tasks[0]?.ha_config?.enable_ha ? (
            <span>Enabled</span>
          ) : (
            <span>Disabled</span>
          )}
        </div>
      </div>
      <hr className={classes.line} />
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Parameters</div>
        <WorkflowParameterListing data={workflowDetails?.data?.parameters} />
      </div>
      <hr className={classes.line} />
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>
          <div className={classes.slackNotificationContainer}>
            <img
              src={`${config.cfMsdAssetUrl}/icons/darwin-slack.svg`}
              alt='Slack Notification'
            />
            <span className={classes.slackLabel}>Slack Notification</span>
          </div>
        </div>
        <div className={classes.workflowDetailsDescription}>
          {workflowDetails?.data?.notify_on
            ? `#${workflowDetails?.data?.notify_on}`
            : 'N/A'}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Created by</div>
        <div className={classes.workflowDetailsDescription}>
          {workflowDetails?.data?.created_by}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Last updated on</div>
        <div className={classes.workflowDetailsDescription}>
          {getFormattedDateTime(workflowDetails?.data?.last_updated_on)}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Created on</div>
        <div className={classes.workflowDetailsDescription}>
          {getFormattedDateTime(workflowDetails?.data?.created_at)}
        </div>
      </div>
      <div className={classes.workflowDetail}>
        <div className={classes.workflowDetailTitle}>Notifications on:</div>
        <div className={classes.workflowDetailsDescription}>
          {workflowDetails?.data?.expected_run_duration && (
            <div className={classes.notification_key}>
              Run Duration (in mins) &gt;{' '}
              {workflowDetails?.data?.expected_run_duration}
            </div>
          )}
          <div>
            {Object.keys(
              workflowDetails?.data?.notification_preference || {}
            ).map((key) => {
              const value = workflowDetails?.data?.notification_preference[key]
              return value ? (
                <div className={classes.notification_key} key={key}>
                  {' '}
                  {NOTIFICATION_ON[key]}
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>

      <UpdateMaxRuns open={showUpdateMaxRuns} onClose={onCloseUpdateMaxRuns} />
      <UpdateRetries open={showUpdateRetries} onClose={onCloseUpdateRetries} />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowDetailsSidePanel
)

export default StyleComponent
