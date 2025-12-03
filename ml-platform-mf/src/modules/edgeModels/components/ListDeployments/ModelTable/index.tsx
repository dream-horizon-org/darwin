import Chip from '@material-ui/core/Chip'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import withStyles from '@mui/styles/withStyles'
import React, {useEffect, useMemo, useState} from 'react'

import {useGQL} from '../../../../../utils/useGqlRequest'
import {EdgeModelsQueryParams} from '../../../data/constants'
import {
  IParsedFilterQuery,
  ModelActions,
  ModelCellData,
  ModelVersionActions
} from '../../../data/types'

import {ClickAwayListener} from '@mui/material'
import {useHistory} from 'react-router'
import {Datatable} from '../../../../../bit-components/datatable/index'
import {
  Popout,
  PopoutHorizontalPositions,
  PopoutVerticalPositions
} from '../../../../../bit-components/popout/index'
import {TableCellSize} from '../../../../../bit-components/table-cells/tc-cell/index'
import useQuery from '../../../../../components/useQuery'
import NoResultsFound from '../../../../../components/workflows/noResultsFound'
import debounce from '../../../../../utils/debounce'
import {getModelReqPayload} from '../../../data/utils'
import type {
  GetModelDeploymentsInput,
  SelectionOnMlModelDeployments
} from '../../../graphQL/queries/getModelDeployments/index'
import {GetModelDeploymentsSchema} from '../../../graphQL/queries/getModelDeployments/index.gqlTypes'
import {GQL as modelGQL} from '../../../graphQL/queries/getModelDeployments/indexGql.js'
import {getColumnComfig, getPopoutOptions} from './columnConfig'
import styles from './indexJSS'

const ActionMap: Record<ModelActions | ModelVersionActions, any> = {
  [ModelActions.ADD]: <AddCircleIcon />,
  [ModelVersionActions.DOWNLOAD]: <CloudDownloadIcon />
}

export function ActionComponent(props: {
  actions: (ModelActions | ModelVersionActions)[]
}) {
  return <div>{props.actions.map((action) => ActionMap[action])}</div>
}

export function Tags({tags}: Pick<ModelCellData, 'tags'>) {
  return (
    <div>
      {Array.isArray(tags) &&
        tags.map((item, idx) => {
          return (
            <Chip style={{margin: '1px'}} label={item} size='small' key={idx} />
          )
        })}
    </div>
  )
}

function ModelTableInner(props) {
  const {classes} = props
  const query = useQuery()
  const history = useHistory()
  const searchQuery = query.get(EdgeModelsQueryParams.QUERY) || ''
  const filtersQuery = query.get(EdgeModelsQueryParams.FILTERS)
  const parsedFiltersQuery: IParsedFilterQuery = JSON.parse(filtersQuery)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [anchorElForPopout, setAnchorElForPopout] =
    useState<HTMLButtonElement | null>(null)

  const [selectedRow, setSelectedRow] = useState<any>(null)

  const {
    output: {response: modelResponnse, loading: modelLoading},
    triggerGQLCall: triggerModelGQLCall
  } = useGQL<any, any>()

  const triggerModelGQLCallDebounce = useMemo(
    () => debounce(triggerModelGQLCall),
    []
  )

  const handleShowMoreTagsClicked = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: SelectionOnMlModelDeployments
  ) => {
    setAnchorElForPopout(e.currentTarget)
    setSelectedRow(item)
    e.stopPropagation()
  }

  const handleShowMoreTagsClosed = (e: any) => {
    setAnchorElForPopout(null)
    setSelectedRow(null)
    e.stopPropagation()
    e.preventDefault()
  }

  const columnConfig = getColumnComfig(classes, handleShowMoreTagsClicked)

  const getModelDeployments = (payload?: GetModelDeploymentsInput) => {
    let queryData = {
      ...modelGQL
    }
    if (payload) {
      queryData = {
        ...queryData,
        variables: payload
      }
    }
    triggerModelGQLCallDebounce(queryData, GetModelDeploymentsSchema)
  }

  useEffect(() => {
    const payload = getModelReqPayload(
      searchQuery,
      parsedFiltersQuery,
      currentPage
    )
    getModelDeployments(payload)
  }, [searchQuery, filtersQuery])

  const pageChangeHandler = (page: number) => {
    if (page === currentPage) {
      return
    }
    const payload = getModelReqPayload(searchQuery, parsedFiltersQuery, page)
    setCurrentPage(page)
    getModelDeployments(payload)
  }

  const refresh = () => {
    const payload = getModelReqPayload(
      searchQuery,
      parsedFiltersQuery,
      currentPage
    )
    getModelDeployments(payload)
  }

  const modelDeployments =
    modelResponnse?.getModelDeployments?.data?.mlModelDeployments

  const totalRows = modelResponnse?.getModelDeployments?.data?.totalDeployments
  return (
    <>
      {
        <div className={classes.dataList}>
          <Datatable<SelectionOnMlModelDeployments>
            enablePagination={totalRows ? true : false}
            enableSelection={false}
            singleSelection={false}
            size={TableCellSize.Medium}
            columnConfig={columnConfig}
            data={(modelDeployments || []).map((item) => ({
              ...item,
              refresh: refresh
            }))}
            indexKeyName={'id'}
            onSelectAllClick={() => {}}
            enableSelectionColumn={false}
            loading={modelLoading}
            totalRow={totalRows}
            pageHandler={(page) => pageChangeHandler(page)}
            page={currentPage}
            onRowClick={(row) => {
              if (row.id) history.push(`/edge-models/info/${row.id}/`)
            }}
          />
        </div>
      }
      {totalRows === 0 ? <NoResultsFound /> : null}
      <ClickAwayListener
        onClickAway={(ev) => {
          if (anchorElForPopout) handleShowMoreTagsClosed(ev)
        }}
      >
        <Popout
          anchorEl={anchorElForPopout}
          optionsList={getPopoutOptions(selectedRow?.tags || [])}
          handleClose={(ev) => {
            handleShowMoreTagsClosed(ev)
            ev.stopPropagation()
            ev.preventDefault()
          }}
          anchorOrigin={{
            vertical: PopoutVerticalPositions.BOTTOM,
            horizontal: PopoutHorizontalPositions.LEFT
          }}
          transformOrigin={{
            vertical: PopoutVerticalPositions.TOP,
            horizontal: PopoutHorizontalPositions.LEFT
          }}
        />
      </ClickAwayListener>
    </>
  )
}

export const ModelTable = withStyles(styles, {withTheme: true})(ModelTableInner)
