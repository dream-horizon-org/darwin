import React, {useEffect, useState} from 'react'

import {withStyles, WithStyles} from '@mui/styles'
import {useQueryParams} from '../../../../hooks/src/useQueryParams/useQueryParams.hook'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {logEvent} from '../../../../utils/events'
import {
  ClustersCreatedByUserRow,
  ClustersDataTable,
  ClustersFilterSection,
  ListingPageHeader,
  RecentlyVisitedClustersRow
} from '../../components'
import {ClusterListingQueryParams} from '../../types'
import styles from './clusterListJSS'
interface IProps extends WithStyles<typeof styles> {}

const ClusterList = (props: IProps) => {
  const {classes} = props
  const [query] = useQueryParams<ClusterListingQueryParams>()

  useEffect(() => {
    logEvent(EventTypes.COMPUTE.LIST_OPEN, SeverityTypes.INFO)
  }, [])

  const filtersContainsData = () => {
    return (
      query?.query ||
      query?.filters?.status?.length > 0 ||
      query?.filters?.users?.length > 0
    )
  }

  return (
    <div className={classes.container} data-testid='cluster-list-container'>
      <ListingPageHeader />
      {!filtersContainsData() && <RecentlyVisitedClustersRow />}
      {!filtersContainsData() && <ClustersCreatedByUserRow />}
      <ClustersFilterSection />
      <ClustersDataTable />
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(ClusterList)

export default styleComponent
