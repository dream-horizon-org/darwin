import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {v4 as uuidv4} from 'uuid'
import {Datatable} from '../../../bit-components/datatable/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {TableCellSize} from '../../../bit-components/table-cells/tc-cell/index'
import {LibraryStatus} from '../../../gql-enums/library-status.enum'
import {
  GetComputeLibrariesInput,
  SelectionOnGetComputeLibraries
} from '../../../modules/compute/pages/graphqlApis/getComputeLibraries'
import {getComputeLibraries} from '../../../modules/compute/pages/graphqlApis/getComputeLibraries/index.thunk'
import {GetComputeLibraryStatusInput} from '../../../modules/compute/pages/graphqlApis/getComputeLibraryStatus'
import {getComputeLibraryStatus} from '../../../modules/compute/pages/graphqlApis/getComputeLibraryStatus/index.thunk'
import {GetComputeLibraryStatusesInput} from '../../../modules/compute/pages/graphqlApis/getComputeLibraryStatuses'
import {getComputeLibraryStatuses} from '../../../modules/compute/pages/graphqlApis/getComputeLibraryStatuses/index.thunk'
import {InstallLibraryInput} from '../../../modules/compute/pages/graphqlApis/installLibrary'
import {installLibrary} from '../../../modules/compute/pages/graphqlApis/installLibrary/index.thunk'
import {
  IComputeInstallLibrary,
  IComputeLibraries,
  IComputeState,
  IComputeUninstallLibrary
} from '../../../modules/compute/pages/graphqlApis/reducer'
import {RetryInstallLibraryInput} from '../../../modules/compute/pages/graphqlApis/retryInstallLibrary'
import {retryInstallLibrary} from '../../../modules/compute/pages/graphqlApis/retryInstallLibrary/index.thunk'
import {UninstallLibraryInput} from '../../../modules/compute/pages/graphqlApis/uninstallLibrary'
import {uninstallLibrary} from '../../../modules/compute/pages/graphqlApis/uninstallLibrary/index.thunk'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import {ZERO_OFFSET} from '../../workflows/allWorkflows/constant'
import NoResultsFound from '../../workflows/noResultsFound'
import ClusterInstallLibraryDrawer from '../clusterInstallLibraryDrawer'
import ClusterLibrariesHeader from '../clusterLibrariesHeader'
import ClusterLibraryDetailDialog from '../clusterLibraryDetailDialog'
import {Data, getColumnConfig} from './columnConfig'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  getComputeLibraries: (
    payload: GetComputeLibrariesInput,
    prevData: SelectionOnGetComputeLibraries
  ) => void
  uninstallLibraryFunc: (payload: UninstallLibraryInput) => void
  getComputeLibraryStatuses: (payload: GetComputeLibraryStatusesInput) => void
  computeLibraries: IComputeState['computeLibraries']
  computeLibraryStatus: IComputeState['computeLibraryStatuses']
  clusterId: string
  clusterStatus: string
  uninstallLibrary: IComputeUninstallLibrary
  installLibraryFunc: (payload: InstallLibraryInput) => void
  installLibrary: IComputeInstallLibrary
  retryInstallLibrary: (payload: RetryInstallLibraryInput) => void
  retryInstallLibraryData: IComputeState['retryInstallLibrary']
}
let interval = null
const ClusterLibraries = (props: IProps) => {
  const {
    classes,
    clusterId,
    clusterStatus,
    computeLibraries,
    computeLibraryStatus,
    getComputeLibraries,
    uninstallLibraryFunc,
    getComputeLibraryStatuses,
    installLibraryFunc,
    uninstallLibrary,
    installLibrary,
    retryInstallLibrary,
    retryInstallLibraryData
  } = props

  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [libraryId, setLibraryId] = useState(0)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [confirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [runningLibraryIds, setRunningLibraryIds] = useState<number[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [libraryData, setLibraryData] = useState<Data[]>(
    computeLibraries?.data?.data?.packages || []
  )
  const sortBy = 'created_at'
  const sortOrder = 'desc'
  const PAGE_SIZE = 15
  const getComputeLibrariesDebounced = useMemo(
    () => debounce(getComputeLibraries),
    []
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [datatableKey, setDatatableKey] = useState(uuidv4())

  useEffect(() => {
    setOffset(0)

    if (computeLibraries.cancel) computeLibraries.cancel()

    const payload: GetComputeLibrariesInput = {
      key: searchQuery,
      pageSize: PAGE_SIZE,
      offset: 0,
      sortBy: sortBy,
      sortOrder: sortOrder,
      cluster_id: clusterId
    }
    getComputeLibrariesDebounced(payload, null)
    setOffset(0)
  }, [searchQuery, clusterStatus])

  useEffect(() => {
    if (offset === 0) return

    if (computeLibraries.cancel) computeLibraries.cancel()

    const payload: GetComputeLibrariesInput = {
      key: searchQuery,
      pageSize: PAGE_SIZE,
      offset: offset,
      sortBy: sortBy,
      sortOrder: sortOrder,
      cluster_id: clusterId
    }
    getComputeLibraries(payload, computeLibraries?.data)
  }, [offset])

  useEffect(() => {
    if (uninstallLibrary?.status === API_STATUS.SUCCESS) {
      setOffset(0)

      const payload: GetComputeLibrariesInput = {
        key: searchQuery,
        pageSize: PAGE_SIZE,
        offset: 0,
        sortBy: sortBy,
        sortOrder: sortOrder,
        cluster_id: clusterId
      }
      getComputeLibraries(payload, null)
      setSelectedRows([])
    }
  }, [uninstallLibrary])

  const stopPolling = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    setIsPolling(false)
  }

  const startPolling = () => {
    stopPolling()

    if (runningLibraryIds.length > 0) {
      setIsPolling(true)

      interval = setInterval(() => {
        const payload: GetComputeLibraryStatusesInput = {
          cluster_id: clusterId,
          library_ids: runningLibraryIds
        }
        getComputeLibraryStatuses(payload)
      }, 5000)
    }
  }

  useEffect(() => {
    if (selectedRows?.length === 0) setDatatableKey(uuidv4())
    if (computeLibraries?.status === API_STATUS.SUCCESS) {
      setLibraryData(computeLibraries?.data?.data?.packages || [])

      const libraries = computeLibraries?.data?.data?.packages || []

      const runningStatusIds = libraries.reduce((acc, library) => {
        if (library.status === LibraryStatus.running) {
          acc.push(library.id)
        }
        return acc
      }, [] as number[])

      setRunningLibraryIds(runningStatusIds)
    }
  }, [computeLibraries])

  useEffect(() => {
    if (computeLibraryStatus?.status === API_STATUS.SUCCESS) {
      const updatedLibraries = libraryData.map((library) => {
        const status = computeLibraryStatus?.data?.data.find(
          (status) => status.library_id === library.id
        )
        if (status) {
          return {...library, status: status.status}
        }
        return library
      })
      setLibraryData(updatedLibraries)

      const updatedRunningLibraryIds = runningLibraryIds.filter((libraryId) => {
        const library = computeLibraryStatus?.data?.data.find(
          (status) => status.library_id === libraryId
        )
        return library?.status === LibraryStatus.running
      })

      setRunningLibraryIds(updatedRunningLibraryIds)
    }
  }, [computeLibraryStatus])

  useEffect(() => {
    if (runningLibraryIds.length > 0) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [runningLibraryIds])

  useEffect(() => {
    if (installLibrary?.status === API_STATUS.SUCCESS) {
      setDrawerOpen(false)
      setOffset(0)

      const payload: GetComputeLibrariesInput = {
        key: searchQuery,
        pageSize: PAGE_SIZE,
        offset: 0,
        sortBy: sortBy,
        sortOrder: sortOrder,
        cluster_id: clusterId
      }
      getComputeLibraries(payload, null)
    }
  }, [installLibrary])

  const handleLibraryClick = (id: number) => {
    setLibraryId(id)
    setOpenDetailDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDetailDialog(false)
  }

  const handleRowClick = (row: Data) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(row.id)) {
        return prevSelectedRows.filter(
          (selectedRowId) => selectedRowId !== row.id
        )
      } else {
        return [...prevSelectedRows, row.id]
      }
    })
  }
  const onDrawerClose = () => {
    setDrawerOpen(false)
  }

  const handleOnSelectAllClick = (params: number[]) => {
    setSelectedRows(params)
  }

  const handleUninstallButtonClick = () => {
    if (selectedRows.length > 0) {
      const payload: UninstallLibraryInput = {
        input: {
          cluster_id: clusterId,
          id: selectedRows
        }
      }
      uninstallLibraryFunc(payload)
    }
    setConfirmationModalOpen(false)
  }

  const triggerInstallLibrary = (payload: InstallLibraryInput) => {
    payload.clusterId = clusterId
    installLibraryFunc(payload)
  }

  const handleLibraryInstallRetry = (libraryId: number) => {
    const payload: RetryInstallLibraryInput = {
      input: {
        cluster_id: clusterId,
        library_id: libraryId
      }
    }
    retryInstallLibrary(payload)
  }

  const columnConfig = getColumnConfig(
    classes,
    handleLibraryClick,
    handleLibraryInstallRetry,
    retryInstallLibraryData.status === API_STATUS.LOADING,
    retryInstallLibraryData.libraryId,
    clusterStatus
  )

  return (
    <div className={classes.container}>
      <ClusterLibrariesHeader
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        clusterStatus={clusterStatus}
        handleUninstallButtonClick={handleUninstallButtonClick}
        selectedRows={selectedRows}
        setConfirmationModalOpen={setConfirmationModalOpen}
        confirmationModalOpen={confirmationModalOpen}
        setDrawerOpen={setDrawerOpen}
      />
      <div className={classes.datatable} key={datatableKey}>
        <Datatable<Data>
          enablePagination={false}
          enableSelection={true}
          singleSelection={false}
          enableStickyHeader={true}
          enableHeader={true}
          size={TableCellSize.Large}
          columnConfig={columnConfig}
          data={libraryData}
          indexKeyName={'id'}
          onSelectAllClick={(params) => {
            handleOnSelectAllClick(params)
          }}
          enableSelectionColumn={true}
          onRowClick={handleRowClick}
          loading={
            offset === ZERO_OFFSET &&
            computeLibraries?.status === API_STATUS.LOADING
          }
          enableInfiniteScroll={true}
          onScrollToPageEnd={() => {
            if (computeLibraries?.status === API_STATUS.LOADING) return

            if (
              offset + PAGE_SIZE <=
              (computeLibraries?.data?.data?.result_size || 0)
            ) {
              setOffset(offset + PAGE_SIZE)
            }
          }}
          loadingNextPageItems={
            offset !== ZERO_OFFSET &&
            computeLibraries?.status === API_STATUS.LOADING
          }
          totalRow={computeLibraries?.data?.data?.result_size}
        />
        {computeLibraries?.status === API_STATUS.SUCCESS &&
          computeLibraries?.data?.data?.packages.length === 0 && (
            <NoResultsFound />
          )}
        {computeLibraries?.status === API_STATUS.LOADING && (
          <div className={classes.loaderContainer}>
            <ProgressCircle
              size={LoaderSize.Large}
              data-testid='workflows-scroll-loading'
            />
          </div>
        )}
      </div>
      {openDetailDialog && (
        <ClusterLibraryDetailDialog
          classes={classes}
          handleDialogClose={handleDialogClose}
          openDialog={openDetailDialog}
          clusterId={clusterId}
          libraryId={libraryId}
        />
      )}
      <ClusterInstallLibraryDrawer
        onClose={onDrawerClose}
        open={drawerOpen}
        triggerInstallLibrary={triggerInstallLibrary}
      />
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    computeLibraries: state.computeReducer.computeLibraries,
    uninstallLibrary: state.computeReducer.computeUninstallLibrary,
    installLibrary: state.computeReducer.computeInstallLibrary,
    computeLibraryStatus: state.computeReducer.computeLibraryStatuses,
    retryInstallLibraryData: state.computeReducer.retryInstallLibrary
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeLibraries: (
      payload: GetComputeLibrariesInput,
      prevData: SelectionOnGetComputeLibraries
    ) => getComputeLibraries(dispatch, payload, prevData),
    uninstallLibraryFunc: (payload: UninstallLibraryInput) =>
      uninstallLibrary(dispatch, payload),
    installLibraryFunc: (payload: InstallLibraryInput) =>
      installLibrary(dispatch, payload),
    getComputeLibraryStatuses: (payload: GetComputeLibraryStatusesInput) =>
      getComputeLibraryStatuses(dispatch, payload),
    getComputeLibraryStatus: (payload: GetComputeLibraryStatusInput) =>
      getComputeLibraryStatus(dispatch, payload),
    retryInstallLibrary: (payload: RetryInstallLibraryInput) =>
      retryInstallLibrary(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClusterLibraries)

export default StyleComponent
