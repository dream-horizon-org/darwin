import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {useGQL} from '../../../../../utils/useGqlRequest'
import styles from './clustersDataTableJSS'

import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {
  Datatable,
  SortOrder
} from '../../../../../bit-components/datatable/index'
import {TableCellSize} from '../../../../../bit-components/table-cells/tc-cell/index'
import NoResultsFound from '../../../../../components/workflows/noResultsFound'
import {useQueryParams} from '../../../../../hooks/src/useQueryParams/useQueryParams.hook'
import {CommonState} from '../../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../../utils/apiUtils'
import debounce from '../../../../../utils/debounce'
import {
  GetSearchedClustersInput,
  SelectionOnGetSearchedClusters
} from '../../../pages/graphqlApis/getSearchedClusters'
import {getSearchedClusters} from '../../../pages/graphqlApis/getSearchedClusters/index.thunk'
import {IComputeState} from '../../../pages/graphqlApis/reducer'
import {ClusterListingQueryParams} from '../../../types'
import {
  COLUMNS_TO_SORT,
  getColumnConfig,
  SORTABLE_COLUMNS,
  TableData
} from './clustersDataTable.helper'
interface IProps extends WithStyles<typeof styles> {
  clustersData: IComputeState['clusters']
  getSearchedClusters: (
    payload: GetSearchedClustersInput,
    prevData: SelectionOnGetSearchedClusters
  ) => void
}

const ClustersDataTable = (props: IProps) => {
  const {classes, clustersData, getSearchedClusters} = props
  const PAGE_SIZE = 20
  const [offset, setOffset] = useState(0)
  const [query, setQuery] = useQueryParams<ClusterListingQueryParams>()
  const [sortBy, setSortBy] = useState<keyof SORTABLE_COLUMNS>('created_on')
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC)
  const history = useHistory()

  const debouncedGetSearchedClusters = useMemo(
    () => debounce(getSearchedClusters, 300),
    []
  )

  useEffect(() => {
    setOffset(0)
    clustersData?.cancel && clustersData.cancel()
    const variables = {
      pageSize: PAGE_SIZE,
      offset: 0,
      query: query.query ?? '',
      sortBy: sortBy,
      sortOrder: sortOrder,
      filters: {
        status: query?.filters?.status ?? [],
        user: query?.filters?.users ?? []
      }
    }
    debouncedGetSearchedClusters(variables, null)
  }, [query, sortBy, sortOrder])

  useEffect(() => {
    if (offset === 0) return
    clustersData?.cancel && clustersData.cancel()

    const variables = {
      pageSize: PAGE_SIZE,
      offset: offset,
      query: query.query ?? '',
      sortBy: sortBy,
      sortOrder: sortOrder,
      filters: {
        status: query?.filters?.status ?? [],
        user: query?.filters?.users ?? []
      }
    }
    getSearchedClusters(variables, clustersData?.data)
  }, [offset])

  return (
    <div className={classes.container}>
      <Datatable<TableData>
        data={clustersData?.data?.data || []}
        indexKeyName='cluster_id'
        enableInfiniteScroll={true}
        infiniteScrollLoader={
          clustersData?.status === API_STATUS.LOADING ||
          clustersData?.status === API_STATUS.INIT
        }
        columnConfig={getColumnConfig(classes)}
        size={TableCellSize.Large}
        onScrollToPageEnd={() => {
          clustersData?.data?.data.length < clustersData?.data?.result_size &&
            setOffset(offset + PAGE_SIZE)
        }}
        enableHeader={true}
        enableStickyHeader={true}
        totalRow={clustersData?.data?.result_size}
        order={sortOrder}
        orderBy={[
          COLUMNS_TO_SORT['created_on'].name
          // COLUMNS_TO_SORT['last_used_on'].name
        ]}
        activeSortColId={COLUMNS_TO_SORT[sortBy].name}
        onRequestSort={(id, columnName, order) => {
          setSortOrder(order === 'desc' ? SortOrder.ASC : SortOrder.DESC)
          const sortBy = Object.keys(COLUMNS_TO_SORT).find(
            (key) => COLUMNS_TO_SORT[key].name === columnName
          )
          setSortBy(sortBy as keyof SORTABLE_COLUMNS)
        }}
        onRowClick={(row) => {
          history.push(`/clusters/${row.cluster_id}/configuration/`)
        }}
      />
      {clustersData?.status === API_STATUS.SUCCESS &&
        clustersData?.data?.data?.length === 0 && (
          <div className={classes.noResultsFoundContainer}>
            <NoResultsFound />
          </div>
        )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    clustersData: state.computeReducer.clusters
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getSearchedClusters: (
      payload: GetSearchedClustersInput,
      prevData: SelectionOnGetSearchedClusters
    ) => getSearchedClusters(dispatch, payload, prevData)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClustersDataTable)

export default styleComponent
