import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  Tags,
  TagsSizes,
  TagsType
} from '../../../bit-components/tags/tags/index'

import {SelectionOnAttachedCluster} from '../../../modules/workflows/graphqlAPIs/getWorkflowRunDetails'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {
  WORKFLOW_STANDARDS_FAIL,
  WORKFLOW_STANDARDS_RUNNING,
  WORKFLOW_STANDARDS_SCHEDULED,
  WORKFLOW_STANDARDS_SKIPPED,
  WORKFLOW_STANDARDS_SUCCESS,
  WORKFLOW_STANDARDS_UPSTREAM_FAIL
} from '../../../modules/workflows/pages/workflows/constants'
import {
  getTagsType,
  onClusterLinkClicked
} from '../../../modules/workflows/pages/workflows/utils'
import {shouldShowClusterLinks} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {aliasTokens} from '../../../theme.contants'
import {API_STATUS} from '../../../utils/apiUtils'
import {getTimeDifference} from '../../../utils/helper'
import Spinner from '../../spinner/spinner'
import {getFormattedDateTime} from '../allWorkflows/utils'
import TimeExceededIcon from '../timeExceededIcon'
import WorkflowParameterListing from '../workflowParameterListing'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setShowSidePanel: (a: boolean) => void
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
}

const WorkflowRunDetailsSidePanel = (props: IProps) => {
  const {classes, setShowSidePanel, workflowRunDetails} = props
  const allClusters: SelectionOnAttachedCluster[] = Object.values(
    workflowRunDetails?.data?.tasks.reduce((acc, curr) => {
      if (!curr.attached_cluster) return acc

      acc[curr.attached_cluster.cluster_id] = curr.attached_cluster
      return acc
    }, {}) || {}
  )
  const [showAllClusters, setShowAllClusters] = React.useState(false)

  const onShowAllClicked = () => {
    setShowAllClusters(!showAllClusters)
  }

  const getItemsToShowForCluster = () => {
    if (!allClusters) {
      return []
    }

    if (showAllClusters) {
      return allClusters
    } else {
      return allClusters.slice(0, 1)
    }
  }

  const getWorkflowRunDetailsStatusClass = (status: string) => {
    switch (status) {
      case WORKFLOW_STANDARDS_SUCCESS:
        return ''
      case WORKFLOW_STANDARDS_RUNNING:
        return 'running'
      case WORKFLOW_STANDARDS_FAIL:
        return 'failed'
      case WORKFLOW_STANDARDS_UPSTREAM_FAIL:
        return 'failed'
      case WORKFLOW_STANDARDS_SKIPPED:
        return 'skipped'
      default:
        return 'failed'
    }
  }

  const getWorkflowRunDetailsStatus = (status: string) => {
    switch (status) {
      case WORKFLOW_STANDARDS_SUCCESS:
        return 'Success'
      case WORKFLOW_STANDARDS_RUNNING:
        return 'Running'
      case WORKFLOW_STANDARDS_FAIL:
        return 'Failed'
      case WORKFLOW_STANDARDS_SKIPPED:
        return 'Skipped'
      case WORKFLOW_STANDARDS_UPSTREAM_FAIL:
        return 'Failed'
      default:
        return 'Failed'
    }
  }

  return (
    <div className={classes.container}>
      <div
        className={classes.collapseIconContainer}
        onClick={() => setShowSidePanel(false)}
      >
        <KeyboardArrowRightIcon className={classes.collapseIcon} />
      </div>
      <div className={classes.title}>
        Run Details
        {workflowRunDetails?.status === API_STATUS.SUCCESS && (
          <>
            <span
              className={`${
                classes.runStatus
              } ${getWorkflowRunDetailsStatusClass(
                workflowRunDetails?.data?.run_status
              )}`}
            >
              {getWorkflowRunDetailsStatus(
                workflowRunDetails?.data?.run_status
              )}
            </span>
            {workflowRunDetails?.data?.trigger ===
            WORKFLOW_STANDARDS_SCHEDULED ? null : (
              <span className={classes.runTrigger}>Manual</span>
            )}
          </>
        )}
      </div>
      {workflowRunDetails?.status === API_STATUS.LOADING && (
        <Spinner size={40} show={true} />
      )}
      {workflowRunDetails?.status === API_STATUS.SUCCESS && (
        <>
          <div className={classes.workflowDetail}>
            <div className={classes.workflowDetailTitle}>Run ID</div>
            <div className={`${classes.workflowDetailsDescription}`}>
              #{workflowRunDetails?.data?.run_id}
            </div>
          </div>
          <div className={classes.workflowDetail}>
            <div className={classes.workflowDetailTitle}>Started</div>
            <div className={`${classes.workflowDetailsDescription}`}>
              {getFormattedDateTime(workflowRunDetails?.data?.start_time)}
            </div>
          </div>
          <div className={classes.workflowDetail}>
            <div className={classes.workflowDetailTitle}>Ended</div>
            <div className={`${classes.workflowDetailsDescription}`}>
              {getFormattedDateTime(workflowRunDetails?.data?.end_time)}
            </div>
          </div>
          <div className={classes.workflowDetail}>
            <div className={classes.workflowDetailTitle}>Duration</div>
            <div className={`${classes.workflowDetailsDescription}`}>
              {workflowRunDetails?.data?.is_run_duration_exceeded ? (
                <div className={classes.runDetailsDuration}>
                  <TimeExceededIcon width={14} height={14} />
                  {getTimeDifference(workflowRunDetails?.data?.duration)}
                  (exceeded {
                    workflowRunDetails?.data?.expected_run_duration
                  }{' '}
                  mins)
                </div>
              ) : (
                getTimeDifference(workflowRunDetails?.data?.duration)
              )}
            </div>
          </div>

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
                        shouldShowClusterLinks(cluster?.cluster_status)
                          ? classes.clusterTitle
                          : ''
                      }
                      onClick={() => {
                        if (shouldShowClusterLinks(cluster?.cluster_status))
                          onClusterLinkClicked('dashboard', cluster.cluster_id)
                      }}
                    >
                      {cluster.cluster_name}
                    </div>
                    {shouldShowClusterLinks(cluster?.cluster_status) && (
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
                {shouldShowClusterLinks(cluster?.cluster_status) && (
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
          <div className={classes.workflowDetail}>
            <div className={classes.workflowDetailTitle}>Parameters</div>
            <WorkflowParameterListing
              data={workflowRunDetails?.data?.parameters}
            />
          </div>
        </>
      )}
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  WorkflowRunDetailsSidePanel
)

export default StyleComponent
