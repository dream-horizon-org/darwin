import {Tooltip} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {ShellLoading} from '../../../../../bit-components/shell-loading/index'
import {routes} from '../../../../../constants'
import {truncate} from '../../../../../utils/helper'
import {useGQL} from '../../../../../utils/useGqlRequest'
import {formattedSnakeString} from '../../../../workflows/pages/workflows/utils'
import {getTimeDiff} from '../../../../workspace/utils'
import {GetRecentlyVisitedClusters} from '../../../graphQL/queries/getRecentlyVisitedClusters'
import {GetRecentlyVisitedClustersSchema} from '../../../graphQL/queries/getRecentlyVisitedClusters/index.gqlTypes'
import {GQL as GetRecentlyVisitedClustersGQL} from '../../../graphQL/queries/getRecentlyVisitedClusters/indexGql'
import {CLUSTER_NAME_TRUNCATE_LENGTH} from '../../../pages/constant'
import styles from './recentlyVisitedClustersRowJSS'

interface IProps extends WithStyles<typeof styles> {}

const RecentlyVisitedClustersRow = (props: IProps) => {
  const {classes} = props
  const history = useHistory()
  const {
    output: {
      response: recentlyVisitedClustersResponse,
      loading: recentlyVisitedClustersLoading,
      errors: recentlyVisitedClustersError
    },
    triggerGQLCall: getRecentlyVisitedClusters
  } = useGQL<null, GetRecentlyVisitedClusters>()
  const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'creating':
        return '#8F8F8F'
      case 'active':
        return '#70D48C'
      case 'inactive':
        return '#ff7070'
      default:
        return '#8F8F8F'
    }
  }

  useEffect(() => {
    getRecentlyVisitedClusters(
      GetRecentlyVisitedClustersGQL,
      GetRecentlyVisitedClustersSchema
    )
  }, [])

  if (
    (recentlyVisitedClustersResponse?.getRecentlyVisitedClusters?.status !==
      'SUCCESS' ||
      recentlyVisitedClustersError ||
      recentlyVisitedClustersResponse?.getRecentlyVisitedClusters?.data
        ?.length === 0) &&
    !recentlyVisitedClustersLoading
  ) {
    return null
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.heading}>Recently Visited</h1>
      </div>
      <div className={classes.cardsContainer}>
        {recentlyVisitedClustersLoading
          ? Array.from(Array(3).keys()).map((index) => (
              <ShellLoading height={72} width={343} key={index} />
            ))
          : recentlyVisitedClustersResponse.getRecentlyVisitedClusters.data.map(
              (cluster) => (
                <Link
                  to={`/clusters/${cluster.cluster_id}/configuration/`}
                  className={classes.card}
                  key={cluster.cluster_id}
                >
                  <div className={classes.cardHeader}>
                    <h4 className={classes.clusterName}>
                      <Tooltip
                        title={
                          cluster.cluster_name.length >
                          CLUSTER_NAME_TRUNCATE_LENGTH
                            ? cluster.cluster_name
                            : ''
                        }
                      >
                        <div data-testid='recently-visited-cluster-name'>
                          {truncate(
                            cluster.cluster_name,
                            CLUSTER_NAME_TRUNCATE_LENGTH
                          )}
                        </div>
                      </Tooltip>
                    </h4>
                    <div className={classes.clusterStatus}>
                      <div
                        className={classes.clusterStatusIndicator}
                        style={{
                          backgroundColor: getIndicatorColor(cluster.status)
                        }}
                      />
                      <div className={classes.clusterStatusText}>
                        {formattedSnakeString(cluster.status)}
                      </div>
                    </div>
                  </div>
                  <div className={classes.cardFooter}>
                    <div className={classes.clusterCoresAndMemory}>
                      {cluster.total_cores} Core / {cluster.total_memory} GB
                    </div>
                    <div className={classes.clusterTime}>
                      {getTimeDiff(cluster.last_visited)}
                    </div>
                  </div>
                </Link>
              )
            )}
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  RecentlyVisitedClustersRow
)
export default StyleComponent
