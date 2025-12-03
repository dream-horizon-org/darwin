import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import {Tooltip} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {ClusterStatus, ClusterStatusIndicator, UsageIndicator} from '../..'
import {ShellLoading} from '../../../../../bit-components/shell-loading/index'
import {routes} from '../../../../../constants'
import {useQueryParams} from '../../../../../hooks/src/useQueryParams/useQueryParams.hook'
import {CommonState} from '../../../../../reducers/commonReducer'
import {truncate} from '../../../../../utils/helper'
import {useGQL} from '../../../../../utils/useGqlRequest'
import {
  GetUserClusters,
  GetUserClustersInput
} from '../../../graphQL/queries/getUserClusters'
import {GetUserClustersSchema} from '../../../graphQL/queries/getUserClusters/index.gqlTypes'
import {GQL as GetUserClustersGQL} from '../../../graphQL/queries/getUserClusters/indexGql'
import {CLUSTER_NAME_TRUNCATE_LENGTH} from '../../../pages/constant'
import {ClusterListingQueryParams} from '../../../types'
import styles from './clustersCreatedByUserRowJSS'

interface IProps extends WithStyles<typeof styles> {
  userDetails: any
}

const ClustersCreatedByUserRow = (props: IProps) => {
  const {classes, userDetails} = props
  const LOADERS_COUNT = 3
  const {
    output: {
      response: userClustersResponse,
      loading: userClustersLoading,
      errors: userClustersError
    },
    triggerGQLCall: triggerSearchComputeGQLCall
  } = useGQL<GetUserClustersInput, GetUserClusters>()
  const [query, setQuery] = useQueryParams<ClusterListingQueryParams>()

  const history = useHistory()

  useEffect(() => {
    triggerSearchComputeGQLCall(
      {
        ...GetUserClustersGQL,
        variables: {
          pageSize: 3,
          offset: 0,
          query: '',
          sortBy: 'created_on',
          sortOrder: 'desc',
          filters: {
            status: [],
            user: [JSON.parse(localStorage.getItem('x-user-details')).email]
          }
        }
      },
      GetUserClustersSchema
    )
  }, [])

  if (
    (userClustersResponse?.getSearchedClusters?.data?.length === 0 ||
      userClustersError ||
      userClustersResponse?.getSearchedClusters?.status !== 'SUCCESS') &&
    !userClustersLoading
  ) {
    return null
  }

  const onViewAllClicked = () => {
    setQuery({
      query: '',
      filters: {
        ...query.filters,
        users: [userDetails.email]
      }
    })
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.title}>
          Created by You
          <span className={classes.clustersCount}>
            {userClustersResponse?.getSearchedClusters?.data?.length || 0}
          </span>
        </div>
        {userClustersResponse?.getSearchedClusters?.result_size >=
          LOADERS_COUNT && (
          <div className={classes.viewAll} onClick={onViewAllClicked}>
            View All
            <ChevronRightRoundedIcon className={classes.viewAllIcon} />
          </div>
        )}
      </div>
      {userClustersLoading ? (
        <div className={classes.loaderContainer}>
          {Array.from(Array(LOADERS_COUNT).keys()).map((index) => (
            <ShellLoading height={144} width={'100%'} key={index} />
          ))}
        </div>
      ) : (
        <div className={classes.cardsContainer}>
          {userClustersResponse?.getSearchedClusters?.data.map(
            (cluster, index) => (
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
                      <div data-testid='created-by-user-section-cluster-name'>
                        {truncate(
                          cluster.cluster_name,
                          CLUSTER_NAME_TRUNCATE_LENGTH
                        )}
                      </div>
                    </Tooltip>
                  </h4>
                  <ClusterStatusIndicator
                    status={cluster.status as ClusterStatus}
                    simpleText
                  />
                </div>
                <div className={classes.cardBody}>
                  <div className={classes.clusterStatsContainer}>
                    <div className={classes.clusterStat}>
                      <h3 className={classes.statMainText}>
                        {cluster.cores.consumed}%
                        <span className={classes.statSubText}>
                          {' '}
                          of {cluster.cores.total} Core
                        </span>
                      </h3>
                      <UsageIndicator
                        usage={cluster.cores.consumed}
                        maxUsage={100}
                      />
                    </div>

                    <div className={classes.clusterStat}>
                      <h3 className={classes.statMainText}>
                        {cluster.memory.consumed}%
                        <span className={classes.statSubText}>
                          {' '}
                          of {cluster.memory.total} GB
                        </span>
                      </h3>
                      <UsageIndicator
                        usage={cluster.memory.consumed}
                        maxUsage={100}
                      />
                    </div>
                  </div>
                  {/* <div className={classes.costContainer}>
                    <div className={classes.divider} />
                    <p className={classes.amount}>
                      <span className={classes.amountHeader}>Total Cost </span>$
                      {Number(cluster.cost).toLocaleString('en-US')}
                    </p>
                  </div> */}
                </div>
                <div className={classes.cardFooter}>
                  <div className={classes.footerLeft}>
                    <p className={classes.runtimeText}>
                      Runtime: {cluster.runtime}
                    </p>
                  </div>
                  {/* <div className={classes.footerRight}>
                    <p className={classes.codespacesText}>
                      Codespaces: {cluster.codespaces}
                    </p>
                  </div> */}
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  userDetails: state.msdUserInfoDetails
})

const StyleComponent = compose<any>(
  connect(mapStateToProps, {}),
  withStyles(styles, {withTheme: true})
)(ClustersCreatedByUserRow)

export default StyleComponent
