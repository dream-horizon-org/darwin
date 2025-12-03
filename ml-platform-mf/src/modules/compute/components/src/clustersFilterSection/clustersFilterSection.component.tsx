import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useMemo} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {ShellLoading} from '../../../../../bit-components/shell-loading/index'
import {IFeatureGroupFiltersValues} from '../../../../../components/featureStore/featureGroupsHeader'
import FilterDrop from '../../../../../components/filterDrop'
import {useQueryParams} from '../../../../../hooks/src/useQueryParams/useQueryParams.hook'
import {CommonState} from '../../../../../reducers/commonReducer'
import {useGQL} from '../../../../../utils/useGqlRequest'
import {GetFilterOptions} from '../../../graphQL/queries/getFilterOptions'
import {GetFilterOptionsSchema} from '../../../graphQL/queries/getFilterOptions/index.gqlTypes'
import {GQL as GetFilterOptionsGQL} from '../../../graphQL/queries/getFilterOptions/indexGql'
import {IComputeState} from '../../../pages/graphqlApis/reducer'
import {ClusterListingQueryParams} from '../../../types'
import styles from './clustersFilterSectionJSS'
interface IProps extends WithStyles<typeof styles> {
  clustersData: IComputeState['clusters']
}

const ClustersFilterSection = (props: IProps) => {
  const {classes, clustersData} = props
  const [query, setQuery] = useQueryParams<ClusterListingQueryParams>()
  const {
    output: {
      response: filterOptionsResponse,
      loading: filterOptionsLoading,
      errors: filterOptionsError
    },
    triggerGQLCall: triggerFilterOptionsGQLCall
  } = useGQL<null, GetFilterOptions>()

  useEffect(() => {
    triggerFilterOptionsGQLCall(GetFilterOptionsGQL, GetFilterOptionsSchema)
  }, [])

  const statusFilterData = useMemo(() => {
    let filterData = {}
    if (filterOptionsResponse) {
      filterOptionsResponse.getFilterOptions?.data?.status?.forEach(
        (status) => {
          filterData[status] = query?.filters?.status?.includes(status) || false
        }
      )
    }

    return filterData
  }, [filterOptionsResponse, query])

  const onStatusChange = (f: IFeatureGroupFiltersValues) => {
    const filters = Object.keys(f).filter((key) => f[key])
    setQuery({
      query: query.query,
      filters: {
        ...query.filters,
        status: filters
      }
    })
  }

  const userFilterData = useMemo(() => {
    let filterData = {}
    if (filterOptionsResponse) {
      filterOptionsResponse.getFilterOptions?.data?.users?.forEach((user) => {
        filterData[user] = query?.filters?.users?.includes(user) || false
      })
    }

    return filterData
  }, [filterOptionsResponse, query])

  const onUserChange = (f: IFeatureGroupFiltersValues) => {
    const filters = Object.keys(f).filter((key) => f[key])
    setQuery({
      query: query.query,
      filters: {
        ...query.filters,
        users: filters
      }
    })
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <p className={classes.title}>
          All Clusters{' '}
          <span
            className={classes.clustersCount}
            data-testid='cluster-list-total-count'
          >
            {clustersData?.data?.result_size || 0}
          </span>
        </p>
        {filterOptionsError ? null : (
          <div className={classes.filtersContainer}>
            <p className={classes.filterByText}>Filter By:</p>
            {filterOptionsLoading ? (
              <>
                <ShellLoading width={50} height={30} />
                <ShellLoading width={50} height={30} />
              </>
            ) : (
              <>
                <FilterDrop
                  data={{
                    name: 'status',
                    values: statusFilterData
                  }}
                  selectFilters={onStatusChange}
                  capitalizeFirstLetter={true}
                  dataTestId='cluster-status-filter-drop'
                />
                <FilterDrop
                  data={{
                    name: 'user',
                    values: userFilterData
                  }}
                  selectFilters={onUserChange}
                  dataTestId='cluster-user-filter-drop'
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    clustersData: state.computeReducer.clusters
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, {}),
  withStyles(styles, {withTheme: true})
)(ClustersFilterSection)

export default styleComponent
