import {Snackbar} from '@material-ui/core'
import {Alert} from '@mui/material'
import config from 'config'
import React, {useEffect, useMemo, useState} from 'react'
import {useHistory} from 'react-router'
import {Surface, SurfaceTypes} from '../../bit-components/surface/index'
import {DataList} from '../../components/dataList/dataList'
import Spinner from '../../components/spinner/spinner'
import {routes} from '../../constants'
import clusterActions, {
  IClusterActions
} from '../../hoc/clusterActions/clusterActions'
import SidePanel from '../../layouts/sidePanel/sidePanel'
import debounce from '../../utils/debounce'
import {useGQL} from '../../utils/useGqlRequest'

import getColumnConfig from './columnConfig'
import styles from './computeListJSS'
import {Search, SearchInput} from './searchComputeClusters'
import {SearchSchema} from './searchComputeClusters.gqlTypes'
import {GQL as searchComputeGql} from './searchComputeClustersGql'

interface IProps extends IClusterActions {
  searchQuery: string
  filters: Object
  filterByMe: boolean
}

const ComputeList = (props: IProps) => {
  const [clusters, setClusters] = useState([])
  const [selectedRow, setSelectedRow] = useState(null)
  const [page, setPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [totalRows, setTotalRows] = useState(0)
  const [loadingComputeData, setLoadingComputeData] = useState(true)
  const [snackbarMessage, setSnackbarMessage] = useState({
    open: false,
    message: null,
    type: null
  })
  const history = useHistory()
  const sortBy = 'created_on'
  const sortOrder = 'desc'

  const {
    output: {response: searchComputeResponse, loading: searchComputeLoading},
    triggerGQLCall: triggerSearchComputeGQLCall
  } = useGQL<SearchInput, Search>()

  const triggerSearchComputeGQLCallDebounced = useMemo(
    () => debounce(triggerSearchComputeGQLCall),
    []
  )

  const {
    searchQuery,
    filters,
    stopClusterResponse,
    startClusterResponse,
    deleteClusterResponse,
    restartClusterResponse,
    onDeleteClusterClicked,
    onRestartClusterClicked,
    onStartClusterClicked,
    onStopClusterClicked,
    filterByMe
  } = props

  const classes = styles({
    selectedRow
  })

  useEffect(() => {
    setPage(1)
    const variables = {
      searchQuery: searchQuery,
      filters: filters,
      pageSize: rowsPerPage,
      offset: 0,
      sortBy: sortBy,
      sortOrder: sortOrder,
      filterByMe: filterByMe
    }
    triggerSearchComputeGQLCallDebounced(
      {...searchComputeGql, variables},
      SearchSchema
    )
  }, [searchQuery, filters, rowsPerPage, filterByMe])

  useEffect(() => {
    if (page === 1) return
    const variables = {
      searchQuery: searchQuery,
      filters: filters,
      pageSize: rowsPerPage,
      offset: (page - 1) * rowsPerPage,
      sortBy: sortBy,
      sortOrder: sortOrder,
      filterByMe: filterByMe
    }
    triggerSearchComputeGQLCall({...searchComputeGql, variables}, SearchSchema)
  }, [page])

  useEffect(() => {
    if (searchComputeResponse) {
      const data = searchComputeResponse.searchComputeClusters.data
      setClusters(data)
      setTotalRows(searchComputeResponse.searchComputeClusters.resultSize)
      setLoadingComputeData(false)
    }
  }, [searchComputeResponse])

  const isSelectedRowExistsInClusters = (clusters, selectedRow) => {
    return (
      clusters.length > 0 &&
      selectedRow &&
      clusters.find((cluster) => cluster.clusterId === selectedRow.clusterId)
    )
  }

  useEffect(() => {
    if (
      clusters.length > 0 &&
      !isSelectedRowExistsInClusters(clusters, selectedRow)
    ) {
      setSelectedRow(clusters[0])
    }
  }, [clusters])

  useEffect(() => {
    if (
      stopClusterResponse &&
      stopClusterResponse?.stopCluster?.status === 'SUCCESS'
    ) {
      const clusterDetails = stopClusterResponse.stopCluster.data
      const clustersCopy = [...clusters]

      const clusterUpdated = clustersCopy.find(
        (cluster) => cluster.clusterId === clusterDetails.cluster_id
      )
      clusterUpdated.status = 'inactive'

      setClusters(clustersCopy)
    }
  }, [stopClusterResponse])

  useEffect(() => {
    if (
      deleteClusterResponse &&
      deleteClusterResponse?.deleteCluster?.status === 'SUCCESS'
    ) {
      const clusterDetails = deleteClusterResponse.deleteCluster.data
      const clustersCopy = [...clusters]

      const clusterDeletedIndex = clustersCopy.findIndex(
        (cluster) => cluster.clusterId === clusterDetails.cluster_id
      )
      clustersCopy.splice(clusterDeletedIndex, 1)
      setClusters(clustersCopy)
    }
  }, [deleteClusterResponse])

  useEffect(() => {
    if (
      startClusterResponse &&
      startClusterResponse.startCluster.status === 'SUCCESS'
    ) {
      const clusterDetails = startClusterResponse.startCluster.data
      const clustersCopy = [...clusters]

      const clusterUpdated = clustersCopy.find(
        (cluster) => cluster.clusterId === clusterDetails.cluster_id
      )
      clusterUpdated.status = 'creating'

      setClusters(clustersCopy)
    }
  }, [startClusterResponse])

  useEffect(() => {
    if (
      startClusterResponse &&
      startClusterResponse.startCluster.status === 'SUCCESS'
    ) {
      const clusterDetails = startClusterResponse.startCluster.data
      const clustersCopy = [...clusters]

      const clusterUpdated = clustersCopy.find(
        (cluster) => cluster.clusterId === clusterDetails.cluster_id
      )
      clusterUpdated.status = 'creating'

      setClusters(clustersCopy)
    }
  }, [startClusterResponse])

  useEffect(() => {
    if (
      restartClusterResponse &&
      restartClusterResponse.reStartCluster.status === 'SUCCESS'
    ) {
      const clusterDetails = restartClusterResponse.reStartCluster.data
      const clustersCopy = [...clusters]

      const clusterUpdated = clustersCopy.find(
        (cluster) => cluster.clusterId === clusterDetails.cluster_id
      )
      clusterUpdated.status = 'creating'

      setClusters(clustersCopy)
      setSnackbarMessage({
        open: true,
        message: 'Cluster restarted successfully!',
        type: 'SUCCESS'
      })
    } else if (
      restartClusterResponse &&
      restartClusterResponse.reStartCluster.status === 'ERROR'
    ) {
      setSnackbarMessage({
        open: true,
        message: 'Error while restarting cluster, Please try again!',
        type: 'ERROR'
      })
    }
  }, [restartClusterResponse])

  const onRowClicked = (_e, _id, item) => setSelectedRow(item)

  const onRowDoubleClicked = (_e, _id, item) => {
    history.push(`${routes.compute}/${item.clusterId}/configuration/`)
  }

  const handleSnackbarClose = () => {
    setSnackbarMessage({
      open: false,
      message: null,
      type: null
    })
  }

  const renderData = (data = []) => {
    return data.length > 0 ? (
      <div className={classes.mainContainer}>
        <div className={classes.datalistContainer}>
          <DataList
            data={data}
            stickyHeader={true}
            columnConfig={getColumnConfig(classes)}
            order={'asc'}
            singleSelection={false}
            indexKeyName={'clusterId'}
            shouldEnableSelection={false}
            rowsPerPageOptions={[5, 10, 20]}
            rowsPerPage={rowsPerPage}
            showEmptyRows={false}
            totalCount={totalRows}
            collapsable={false}
            loader={searchComputeLoading}
            onClick={onRowClicked}
            onDoubleClick={onRowDoubleClicked}
            onPageChange={(page) => setPage(page + 1)}
            onPageSizeChange={(pageSize) => setRowsPerPage(pageSize)}
            offset={(page - 1) * rowsPerPage}
            enablePagination={true}
            selectedRows={[selectedRow]}
          />
        </div>
        <div className={classes.sidePanelContainer}>
          <SidePanel
            loadingData={searchComputeLoading}
            clusterName={selectedRow?.clusterName}
            jupyterLabLink={selectedRow?.jupyterLabLink}
            tags={selectedRow?.tags}
            createdOn={selectedRow?.createdOn}
            clusterId={selectedRow?.clusterId}
            clusterStatus={selectedRow?.status}
            onStopClusterClicked={onStopClusterClicked}
            onDeleteClusterClicked={onDeleteClusterClicked}
            onStartClusterClicked={onStartClusterClicked}
            onReStartClusterClicked={onRestartClusterClicked}
          />
        </div>
      </div>
    ) : (
      <div className={classes.noResultsFoundContainer}>
        <Surface type={SurfaceTypes.Primary}>
          <div className={classes.noResultsTextContainer}>
            <p>No Results Found</p>
          </div>
        </Surface>
      </div>
    )
  }

  return (
    <div className={classes.listContainer}>
      <Snackbar
        open={snackbarMessage.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage.type?.toLowerCase()}
          sx={{width: '100%'}}
        >
          {snackbarMessage.message}
        </Alert>
      </Snackbar>
      {loadingComputeData ? (
        <div className={classes.loader}>
          <Spinner show={loadingComputeData} size={60} />
        </div>
      ) : (
        renderData(clusters)
      )}
    </div>
  )
}

export default clusterActions(ComputeList)
