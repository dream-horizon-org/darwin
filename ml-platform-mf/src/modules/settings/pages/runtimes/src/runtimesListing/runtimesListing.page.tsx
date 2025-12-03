import {Button} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import React, {useEffect, useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {
  Button as SportaButton,
  ButtonVariants
} from '../../../../../../bit-components/button/index'
import {Datatable} from '../../../../../../bit-components/datatable/index'
import {Icons} from '../../../../../../bit-components/icon/index'
import {TableCellSize} from '../../../../../../bit-components/table-cells/tc-cell/index'
import SearchBar from '../../../../../../components/searchBar'
import {useDebounce, usePolling} from '../../../../../../hooks'
import {EventTypes, SeverityTypes} from '../../../../../../types/events.types'
import {logEvent} from '../../../../../../utils/events'
import {useGQL} from '../../../../../../utils/useGqlRequest'
import {
  GetRuntimesInformation,
  GetRuntimesInformationInput
} from '../../../../graphqlApi/runtimes/getRunetimesInformation'
import {GetRuntimesInformationSchema} from '../../../../graphqlApi/runtimes/getRunetimesInformation/index.gqlTypes'
import {GQL as GetRuntimesInformationGQL} from '../../../../graphqlApi/runtimes/getRunetimesInformation/indexGql'
import {
  GetRuntimesStatus,
  GetRuntimesStatusInput
} from '../../../../graphqlApi/runtimes/getRuntimesStatus'
import {GetRuntimesStatusSchema} from '../../../../graphqlApi/runtimes/getRuntimesStatus/index.gqlTypes'
import {GQL as GetRuntimesStatusGQL} from '../../../../graphqlApi/runtimes/getRuntimesStatus/indexGql'
import {RuntimeListingTableData} from '../../../../interfaces/runtimes'
import {getColumnConfig, transformData} from './runtimesListing.helper'
import styles from './runtimesListingJSS'

interface IProps extends WithStyles<typeof styles> {}

const RuntimesListingPage = (props: IProps) => {
  const {classes} = props
  const DEFAULT_OFFSET = 0
  const DEFAULT_DEBOUNCE_TIME = 1000
  const STATUS_POLLING_INTERVAL = 5000
  const RECORDS_PER_REQUEST = 20
  const [data, setData] = React.useState<RuntimeListingTableData[]>([])
  const [searchValue, setSearchValue] = React.useState('')
  const [offset, setOffset] = React.useState(DEFAULT_OFFSET)
  const history = useHistory()
  const navigateToCreateRuntime = () => {
    history.push(`/settings/runtimes/create`)
  }
  const navigateToDetailsPage = (runtime: RuntimeListingTableData) => {
    history.push(`/settings/runtimes/details/${runtime.runtimeName}`)
  }

  // GQL Call to get runtimes information
  const {
    output: {
      response: runtimesInformation,
      loading: runtimesInformationLoading,
      errors: runtimesInformationError
    },
    triggerGQLCall: getRuntimesInformation
  } = useGQL<GetRuntimesInformationInput, GetRuntimesInformation>()

  // GQL Call to get runtimes status
  const {
    output: {
      response: runtimesStatus,
      loading: runtimesStatusLoading,
      errors: runtimesStatusError
    },
    triggerGQLCall: getRuntimesStatus
  } = useGQL<GetRuntimesStatusInput, GetRuntimesStatus>()

  // Callbacks for GQL calls
  const getRuntimesInformationCallback = React.useCallback(
    (input: GetRuntimesInformationInput) => {
      getRuntimesInformation(
        {
          ...GetRuntimesInformationGQL,
          variables: input
        },
        GetRuntimesInformationSchema
      )
    },
    []
  )

  const getRuntimesStatusCallback = React.useCallback(
    (input: GetRuntimesStatusInput) => {
      getRuntimesStatus(
        {
          ...GetRuntimesStatusGQL,
          variables: input
        },
        GetRuntimesStatusSchema
      )
    },
    []
  )

  // Method to handle offset change
  const handleOffsetChange = () => {
    const totalRecords =
      runtimesInformation?.getRuntimesInformation?.total_records || 0
    const newOffset = offset + RECORDS_PER_REQUEST
    if (newOffset <= totalRecords) {
      setOffset(newOffset)
    }
  }

  // Method to handle search value change. Search value onChange -> wait for debounce time -> trigger GQL call
  useDebounce(
    () =>
      getRuntimesInformationCallback({
        offset: DEFAULT_OFFSET,
        pageSize: RECORDS_PER_REQUEST,
        query: searchValue
      }),
    DEFAULT_DEBOUNCE_TIME,
    [searchValue],
    {
      avoidCallOnFirstRender: true
    }
  )

  useEffect(() => {
    logEvent(EventTypes.CUSTOM_RUNTIME.LIST_OPEN, SeverityTypes.INFO)
  }, [])

  // Trigger GQL call on offset change
  useEffect(() => {
    getRuntimesInformationCallback({
      offset: offset,
      pageSize: RECORDS_PER_REQUEST,
      query: searchValue
    })
  }, [offset])

  // Append data to table on GQL response for runtimes information
  useEffect(() => {
    if (runtimesInformation) {
      const oldRuntimes = offset === 0 ? [] : data
      const runtimes = [...oldRuntimes, ...transformData(runtimesInformation)]
      setData(runtimes)
    }

    return () => {
      setData([])
    }
  }, [runtimesInformation])

  // Polling for status

  usePolling(
    () =>
      getRuntimesStatusCallback({
        offset: 0,
        pageSize: offset + RECORDS_PER_REQUEST,
        query: searchValue
      }),
    STATUS_POLLING_INTERVAL,
    runtimesStatusLoading || runtimesInformationLoading
  )

  //   // Update status data on GQL response for runtimes status

  useEffect(() => {
    if (runtimesStatus) {
      const runtimes = [...data]
      runtimes.forEach((runtime) => {
        const status = runtimesStatus?.getRuntimesInformation?.data?.find(
          (status) => status.name === runtime.runtimeName
        )
        if (status) {
          runtime.status = status.status
        }
      })
      setData(runtimes)
    }

    return () => {
      setData([])
    }
  }, [runtimesStatus])

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.titleContainer}>
          <h1 className={classes.pageTitle}>Runtime</h1>
        </div>
        <div className={classes.actionsContainer}>
          <div className={classes.searchContainer}>
            <SearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder='Search Runtimes, Owner...'
              dataTestestid='byor-listing-search-bar'
            />
          </div>
          <Button
            className={classes.addRuntimeButton}
            variant='contained'
            disableRipple
            onClick={navigateToCreateRuntime}
            size='large'
          >
            <p data-testid='runtime-listing-add-runtime-button'>Add Runtime</p>
          </Button>
        </div>
      </div>
      <div className={classes.contentContainer}>
        <Datatable<RuntimeListingTableData>
          data={data}
          loading={runtimesInformationLoading}
          columnConfig={getColumnConfig(classes)}
          indexKeyName='id'
          enableSelection={false}
          onRowClick={(row) => {
            !runtimesInformationLoading && navigateToDetailsPage(row)
          }}
          size={TableCellSize.Large}
          enableInfiniteScroll={true}
          enablePagination={false}
          onScrollToPageEnd={handleOffsetChange}
          loadingNextPageItems={runtimesInformationLoading && offset !== 0}
          totalRow={runtimesInformation?.getRuntimesInformation?.total_records}
          tableContainerHeight={700}
          enableStickyHeader={true}
        />
        {searchValue &&
          data.length === 0 &&
          !runtimesInformationLoading &&
          !runtimesInformationError && (
            <div className={classes.emptyStateContainer}>
              <img
                src={`${config.cfMsdAssetUrl}/icons/no-projects-found.svg`}
              />
              <h1 className={classes.emptyStateTitle}>No matches found</h1>
              <p className={classes.emptyStateSubtitle}>
                Please refine your search
              </p>
              <SportaButton
                buttonText='RESET'
                leadingIcon={Icons.ICON_REFRESH}
                onClick={() => {
                  setSearchValue('')
                }}
                variant={ButtonVariants.TERTIARY}
              />
            </div>
          )}
        {data.length === 0 &&
          !searchValue &&
          !runtimesInformationLoading &&
          !runtimesInformationError && (
            <div className={classes.emptyStateContainer}>
              <img
                src={`${config.cfMsdAssetUrl}/icons/no-projects-found.svg`}
              />
              <h1 className={classes.emptyStateTitle}>No runtimes found</h1>
            </div>
          )}

        {runtimesInformationError && (
          <div className={classes.emptyStateContainer}>
            <img src={`${config.cfMsdAssetUrl}/icons/no-projects-found.svg`} />
            <h1 className={classes.emptyStateTitle}>Something went wrong!</h1>
          </div>
        )}
      </div>
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(
  RuntimesListingPage
)

export default StyledComponent
