import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button, ButtonVariants} from '../../bit-components/button/index'
import {Icons} from '../../bit-components/icon/index'
import styles from './clusterLogsJSS'

import {Drawer} from '@mui/material'
import LogsTimeline from '../../components/compute/logsTimeline/logsTimeline'

import {
  GetActionGroupDetails,
  GetActionGroupDetailsInput
} from './getActionGroupDetails'
import {GetActionGroupDetailsSchema} from './getActionGroupDetails.gqlTypes'
import {GQL as getActionGroupDetailsGQL} from './getActionGroupDetailsGql'
import {GetActionGroups, GetActionGroupsInput} from './getActionGroups'
import {GetActionGroupsSchema} from './getActionGroups.gqlTypes'
import {GQL as getActionGroupsGQL} from './getActionGroupsGql'

import {Surface, SurfaceTypes} from '../../bit-components/surface/index'
import Spinner from '../../components/spinner/spinner'
import {useGQL} from '../../utils/useGqlRequest'
import ClusterLogsLastUpdated from '../clusterLogsLastUpdated/clusterLogsLastUpdated'

interface IProps extends WithStyles<typeof styles> {
  clusterId: string
  clusterName: string
  computeCurrentStatus: string
}

const clusterLogs = (props: IProps) => {
  const [collapsedEventsData, setCollapsedEventsData] = useState(null)
  const [selectedClusterRuntime, setSelectedClusterRuntime] = useState(null)
  const [eventsData, setEventsData] = useState(null)
  const {classes, clusterId, clusterName} = props
  const [offset, setOffset] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [hasMoreData, setHasMoreData] = useState(true)
  const PAGE_SIZE = 10

  const {
    output: {
      response: getActionGroupsResponse,
      loading: getActionGroupsLoading
    },
    triggerGQLCall: triggerGetActionGroupsGQLCall
  } = useGQL<GetActionGroupsInput, GetActionGroups>()

  const {
    output: {
      response: getActionGroupDetailsResponse,
      loading: getActionGroupDetailsLoading
    },
    triggerGQLCall: triggerGetActionGroupDetailsGQLCall
  } = useGQL<GetActionGroupDetailsInput, GetActionGroupDetails>()

  const observer = useRef<any>()
  const lastElementRef = useCallback(
    (node) => {
      if (getActionGroupsLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreData) {
          setOffset(offset + PAGE_SIZE)
        }
      })

      if (node) observer.current.observe(node)
    },
    [hasMoreData, getActionGroupsLoading]
  )

  useEffect(() => {
    if (getActionGroupsResponse) {
      if (getActionGroupsResponse.getActionGroups.data.length < PAGE_SIZE) {
        setHasMoreData(false)
      }

      if (collapsedEventsData) {
        setCollapsedEventsData([
          ...collapsedEventsData,
          ...getActionGroupsResponse.getActionGroups.data
        ])
      } else {
        setCollapsedEventsData(getActionGroupsResponse.getActionGroups.data)
      }
    }
  }, [getActionGroupsResponse])

  useEffect(() => {
    setLastUpdated(new Date())
    const variables = {
      clusterId: clusterId,
      pageSize: PAGE_SIZE,
      offset: offset,
      sortOrder: 'desc'
    }
    triggerGetActionGroupsGQLCall(
      {
        ...getActionGroupsGQL,
        variables
      },
      GetActionGroupsSchema
    )
  }, [offset])

  useEffect(() => {
    if (getActionGroupDetailsResponse) {
      setEventsData(getActionGroupDetailsResponse.getActionGroupDetails.data)
    }
  }, [getActionGroupDetailsResponse])

  useEffect(() => {
    if (selectedClusterRuntime) {
      const variables = {
        clusterRuntimeId: selectedClusterRuntime,
        sortOrder: 'desc'
      }
      triggerGetActionGroupDetailsGQLCall(
        {
          ...getActionGroupDetailsGQL,
          variables
        },
        GetActionGroupDetailsSchema
      )
    }
  }, [selectedClusterRuntime])

  const onEventLinkClicked = (clusterRuntimeId: string) => {
    setSelectedClusterRuntime(clusterRuntimeId)
  }

  const onRefreshed = () => {
    setCollapsedEventsData(null)
    setOffset(0)
    setLastUpdated(new Date())
    const variables = {
      clusterId: clusterId,
      pageSize: PAGE_SIZE,
      offset: 0,
      sortOrder: 'desc'
    }
    triggerGetActionGroupsGQLCall(
      {
        ...getActionGroupsGQL,
        variables
      },
      GetActionGroupsSchema
    )
  }

  return (
    <div className={classes.container}>
      <div className={classes.refresh}>
        {lastUpdated && (
          <ClusterLogsLastUpdated lastUpdatedTime={lastUpdated} />
        )}
        <div className={classes.btnContainer}>
          <Button
            buttonText={'refresh'}
            onClick={onRefreshed}
            variant={ButtonVariants.TERTIARY}
            leadingIcon={Icons.ICON_REFRESH}
          />
        </div>
      </div>
      <div>
        {collapsedEventsData?.map((event, idx) => (
          <LogsTimeline
            onEventLinkClicked={onEventLinkClicked}
            collapsedEventsData={event}
            clusterRuntimeId={event.cluster_runtime_id}
            lastElementRef={
              idx === collapsedEventsData.length - 1 ? lastElementRef : null
            }
            computeCurrentStatus={props.computeCurrentStatus}
          />
        ))}

        {getActionGroupsLoading && (
          <div className={classes.loaderContainer}>
            <Spinner show={getActionGroupsLoading} />
          </div>
        )}

        {!getActionGroupsLoading &&
          collapsedEventsData &&
          collapsedEventsData.length === 0 && (
            <div className={classes.noResultsFoundContainer}>
              <Surface type={SurfaceTypes.Primary}>
                <div className={classes.noResultsTextContainer}>
                  <p>No Logs Found</p>
                </div>
              </Surface>
            </div>
          )}

        {selectedClusterRuntime && (
          <Drawer
            anchor={'right'}
            open={selectedClusterRuntime}
            onClose={() => setSelectedClusterRuntime(null)}
            classes={{
              paper: classes.drawer
            }}
          >
            <div className={classes.drawerHeading}>
              <span
                className={`${Icons.ICON_CLOSE} ${classes.closeIcon}`}
                onClick={() => setSelectedClusterRuntime(null)}
              />
              <h1 className={classes.heading}>{clusterName}</h1>
            </div>
            <div className={classes.drawerContent}>
              {getActionGroupDetailsLoading && (
                <div className={classes.loaderContainer}>
                  <Spinner show={getActionGroupDetailsLoading} />
                </div>
              )}
              {eventsData && !getActionGroupDetailsLoading && (
                <LogsTimeline
                  onEventLinkClicked={onEventLinkClicked}
                  eventsData={eventsData}
                  computeCurrentStatus={props.computeCurrentStatus}
                />
              )}
            </div>
          </Drawer>
        )}
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(clusterLogs)

export default styleComponent
