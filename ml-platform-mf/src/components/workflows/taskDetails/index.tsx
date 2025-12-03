import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {Tooltip} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Chip} from '../../../bit-components/chip/index'
import {Tags, TagsSizes} from '../../../bit-components/tags/tags/index'
import {routes} from '../../../constants'
import {
  invalidProjectId,
  sourceTypes
} from '../../../modules/workflows/constants'
import {SelectionOnPackages} from '../../../modules/workflows/graphqlAPIs/getWorkflowTaskDetails'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {
  getTagsType,
  onClusterLinkClicked
} from '../../../modules/workflows/pages/workflows/utils'
import {getInputParametersValue} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import Spinner from '../../spinner/spinner'
import WorkflowParameterListing from '../workflowParameterListing'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowTaskDetailsWithoutRun: IWorkflowsDetailsState['workflowTaskDetailsWithoutRun']
  setShowTaskDetailsSidePanel: React.Dispatch<React.SetStateAction<boolean>>
  showTaskDetailsSidePanel: boolean
  setShowSidePanel: (a: boolean) => void
}

const TaskDetails = (props: IProps) => {
  const {workflowTaskDetailsWithoutRun, setShowSidePanel, classes} = props
  const handlePathLinkClick = () => {
    if (
      workflowTaskDetailsWithoutRun?.data?.source_type === sourceTypes[0].value
    ) {
      const workspacePath =
        workflowTaskDetailsWithoutRun?.data?.source +
        '/' +
        workflowTaskDetailsWithoutRun?.data?.file_path
      const pId = workflowTaskDetailsWithoutRun?.data?.project_id?.toString()
      const cId = workflowTaskDetailsWithoutRun?.data?.codespace_id?.toString()
      window.open(
        `${routes.sharedWorkspace
          .replace(':pId', pId)
          .replace(':cId', cId)}/?lab_url=fsx/workspace/${workspacePath}`,
        '_blank'
      )
    } else if (
      workflowTaskDetailsWithoutRun?.data?.source_type === sourceTypes[1].value
    ) {
      window.open(`${workflowTaskDetailsWithoutRun?.data?.source}`, '_blank')
    }
  }
  const displayWorkflowTaskLibraries = (
    packages: Array<SelectionOnPackages | null> | null
  ) => {
    if (!packages || packages.length === 0) {
      return '--'
    }
    return packages.map((library, index) => {
      const name = library?.body?.name || library?.body?.path || '--'
      return <li key={index}>{name}</li>
    })
  }
  return (
    <div className={classes.container}>
      <div
        className={classes.collapseIconContainer}
        onClick={() => setShowSidePanel(false)}
      >
        <KeyboardArrowRightIcon className={classes.collapseIcon} />
      </div>
      {workflowTaskDetailsWithoutRun?.status === API_STATUS.SUCCESS ? (
        <>
          <div className={classes.title}>
            {workflowTaskDetailsWithoutRun?.data?.task_id}
          </div>
          <div className={classes.taskDetailsContainer}>
            <div className={classes.taskDetail}>
              <div className={classes.taskDetailTitle}>Source</div>
              <div className={`${classes.taskDetailsDescription}`}>
                {workflowTaskDetailsWithoutRun?.data?.source_type}
              </div>
            </div>
            {workflowTaskDetailsWithoutRun?.data?.source_type ===
            sourceTypes[1].value ? (
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>Git Repo URL</div>
                <div className={`${classes.taskDetailsDescription}`}>
                  <Tooltip
                    title={workflowTaskDetailsWithoutRun?.data?.file_path || ''}
                  >
                    <div
                      className={classes.pathLink}
                      onClick={handlePathLinkClick}
                    >
                      Github Link
                      <OpenInNewIcon className={classes.openInNewTabIcon} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>Path</div>
                {workflowTaskDetailsWithoutRun?.data?.project_id ===
                invalidProjectId ? (
                  <div className={classes.taskDetailsDescription}>
                    {workflowTaskDetailsWithoutRun?.data?.source +
                      '/' +
                      workflowTaskDetailsWithoutRun?.data?.file_path}
                  </div>
                ) : (
                  <div
                    className={`${classes.taskDetailsDescription}`}
                    onClick={handlePathLinkClick}
                  >
                    <Tooltip
                      title={
                        workflowTaskDetailsWithoutRun?.data?.source +
                          '/' +
                          workflowTaskDetailsWithoutRun?.data?.file_path || ''
                      }
                    >
                      <div className={classes.pathLink}>
                        Workspace Link
                        <OpenInNewIcon className={classes.openInNewTabIcon} />
                      </div>
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
          </div>
          {workflowTaskDetailsWithoutRun?.data?.source_type ===
          sourceTypes[1].value ? (
            <div className={classes.taskDetail}>
              <div className={classes.taskDetailTitle}>Path</div>
              <div className={`${classes.taskDetailsDescription}`}>
                {workflowTaskDetailsWithoutRun?.data?.file_path}
              </div>
            </div>
          ) : null}
          <div className={classes.taskDetail}>
            <div className={classes.taskDetailTitle}>
              Dynamically update code files
            </div>
            <div className={classes.taskDetailsDescription}>
              {workflowTaskDetailsWithoutRun?.data?.dynamic_artifact
                ? 'Yes'
                : 'No'}
            </div>
          </div>
          <hr className={classes.line} />
          <div className={classes.taskDetail}>
            <div className={classes.taskDetailTitle}>
              <div className={classes.left}>Cluster</div>
            </div>
            <div className={classes.clusterContainer}>
              <div className={classes.clusterTitleContainer}>
                <div className={classes.left}>
                  <div
                    className={
                      workflowTaskDetailsWithoutRun?.data?.attached_cluster
                        ?.cluster_status
                        ? classes.clusterTitle
                        : ''
                    }
                    onClick={() => {
                      if (
                        workflowTaskDetailsWithoutRun?.data?.attached_cluster
                          ?.cluster_status
                      )
                        onClusterLinkClicked(
                          'dashboard',
                          workflowTaskDetailsWithoutRun?.data?.attached_cluster
                            ?.cluster_id
                        )
                    }}
                  >
                    {
                      workflowTaskDetailsWithoutRun?.data?.attached_cluster
                        ?.cluster_name
                    }
                  </div>
                  {workflowTaskDetailsWithoutRun?.data?.attached_cluster
                    ?.cluster_status && (
                    <OpenInNewIcon
                      onClick={() =>
                        onClusterLinkClicked(
                          'dashboard',
                          workflowTaskDetailsWithoutRun?.data?.attached_cluster
                            ?.cluster_id
                        )
                      }
                      className={classes.openInNewTabIcon}
                    />
                  )}
                  {workflowTaskDetailsWithoutRun?.data?.attached_cluster
                    ?.cluster_status && (
                    <span className={classes.tag}>
                      <Tags
                        label={
                          workflowTaskDetailsWithoutRun?.data?.attached_cluster
                            ?.cluster_status
                        }
                        type={getTagsType(
                          workflowTaskDetailsWithoutRun?.data?.attached_cluster
                            ?.cluster_status
                        )}
                        size={TagsSizes.Small}
                      />
                    </span>
                  )}
                </div>
                {/* <LinkOffIcon className={classes.openInNewTabIcon} /> */}
              </div>
              <div className={classes.clusterInfo}>
                {workflowTaskDetailsWithoutRun?.data?.attached_cluster.cores}{' '}
                Core /{' '}
                {workflowTaskDetailsWithoutRun?.data?.attached_cluster.memory}{' '}
                GB
              </div>
              <div className={classes.clusterInfo}>
                {workflowTaskDetailsWithoutRun?.data?.attached_cluster.runtime}
              </div>
              {workflowTaskDetailsWithoutRun?.data?.attached_cluster
                ?.cluster_status && (
                <div className={classes.dashboards}>
                  <div
                    className={classes.dashboard}
                    onClick={() =>
                      onClusterLinkClicked(
                        'events',
                        workflowTaskDetailsWithoutRun?.data?.attached_cluster
                          .cluster_id
                      )
                    }
                  >
                    <span>Events</span>
                    <OpenInNewIcon className={classes.openInNewTabIcon} />
                  </div>
                  <div
                    className={classes.dashboard}
                    onClick={() =>
                      onClusterLinkClicked(
                        'dashboard',
                        workflowTaskDetailsWithoutRun?.data?.attached_cluster
                          .cluster_id
                      )
                    }
                  >
                    <span>Dashboard</span>
                    <OpenInNewIcon className={classes.openInNewTabIcon} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={classes.taskDetail}>
            <div className={classes.taskDetailTitle}>Libraries</div>{' '}
            <div className={classes.taskDetailsDescription}>
              {displayWorkflowTaskLibraries(
                workflowTaskDetailsWithoutRun?.data?.packages
              )}
            </div>
            {/* <div className={`${classes.taskDetailsDescription}`}>
              {workflowTaskDetailsWithoutRun?.data?.dependent_libraries || '--'}
            </div> */}
          </div>
          <hr className={classes.line} />
          <div className={classes.taskDetail}>
            <div className={classes.taskDetailTitle}>Depends On</div>
            <div className={`${classes.taskDetailsDescription}`}>
              {workflowTaskDetailsWithoutRun?.data?.depends_on?.length > 0
                ? workflowTaskDetailsWithoutRun?.data?.depends_on.map((tag) => (
                    <span className={classes.dependsOnChip} id={tag}>
                      <Chip label={tag} key={tag} />
                    </span>
                  ))
                : '--'}
            </div>
            <div className={classes.dependencyContainer}>
              <span className={classes.taskDetailTitle}>
                Run if dependencies:
              </span>
              <span className={classes.triggerConditionText}>
                {workflowTaskDetailsWithoutRun?.data?.depends_on?.length > 0
                  ? workflowTaskDetailsWithoutRun?.data?.trigger_rule
                  : '--'}
              </span>
            </div>
          </div>
          <hr className={classes.line} />
          <div className={`${classes.eventsText} ${classes.taskDetail}`}>
            <span className={classes.taskDetailTitle}>
              Notify when this task:
            </span>
            {/* Can traverse and add multiples of chips */}
            <div className={classes.dependsOnChip}>
              {workflowTaskDetailsWithoutRun?.data?.notification_preference
                ?.on_fail && (
                <div className={classes.notificationPreference}>Fails</div>
              )}
              {!workflowTaskDetailsWithoutRun?.data?.notification_preference
                ?.on_fail && (
                <div className={classes.notificationPreference}>--</div>
              )}
            </div>
          </div>
          <div className={classes.formFieldContainer}>
            <span className={classes.taskDetailTitle}>Slack Channel</span>
            <span className={classes.taskDetailsDescription}>
              {workflowTaskDetailsWithoutRun?.data?.notify_on || '--'}
            </span>
          </div>
          <hr className={classes.line} />
          <div className={classes.taskDetail}>
            <div className={classes.taskDetailTitle}>Parameters</div>
            <WorkflowParameterListing
              data={workflowTaskDetailsWithoutRun?.data?.input_parameters}
            />
          </div>
          <hr className={classes.line} />
          <div className={classes.taskDetailsContainer}>
            <div className={classes.taskDetail}>
              <div className={classes.taskDetailTitle}>Retries</div>
              <div className={`${classes.taskDetailsDescription}`}>
                {workflowTaskDetailsWithoutRun?.data?.retries || '--'}
              </div>
            </div>
            <div className={classes.taskDetail}>
              <div className={classes.taskDetailTitle}>Timeout (in sec)</div>
              <div className={`${classes.taskDetailsDescription}`}>
                {workflowTaskDetailsWithoutRun?.data?.timeout || '--'}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={classes.loaderContainer}>
          <Spinner
            size={40}
            show={workflowTaskDetailsWithoutRun.status === API_STATUS.LOADING}
          />
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflowTaskDetailsWithoutRun:
    state.workflowDetailsReducer.workflowTaskDetailsWithoutRun
})

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(TaskDetails)

export default StyleComponent
