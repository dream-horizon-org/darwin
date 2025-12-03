import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {Typography} from '@mui/material'
import config from 'config'
import React, {MouseEvent, useEffect, useMemo, useState} from 'react'
import {compose} from 'redux'
import {DataList} from '../../../../components/dataList/dataList'
import SearchAndFilter from '../../../../components/searchAndFilter/searchAndFilter'
import {routes} from '../../../../constants'
import {IColumnConfig} from '../../../../types/columnConfig.type'
import {
  IFilters,
  IOwner,
  ITag,
  OWNER,
  TAG
} from '../../../../types/filters.type'
import debounce from '../../../../utils/debounce'
import {useGQL} from '../../../../utils/useGqlRequest'
import getColumnConfig from './columnConfig'
import DisplayTagsDialog from './DispayTagsDialog/DisplayTagsDialog'
import {
  FetchFeatureJobsById,
  FetchFeatureJobsByIdInput
} from './duck/featureJobById'
import {FetchFeatureJobsByIdSchema} from './duck/featureJobById.gqlTypes'
import {GQL as featureJobByIdGql} from './duck/featureJobByIdGql'
import {
  FetchFilteredFeatureGroups,
  FetchFilteredFeatureGroupsInput
} from './duck/fetchFilteredFeatureGroups'
import {FetchFilteredFeatureGroupsSchema} from './duck/fetchFilteredFeatureGroups.gqlTypes'
import {GQL as fetchFilteredFeatureGroupsGql} from './duck/fetchFilteredFeatureGroupsGql'
import {FetchAllFilters} from './duck/filterList'
import {FetchAllFiltersSchema} from './duck/filterList.gqlTypes'
import {GQL as filterListGql} from './duck/filterListGql'
import styles from './FeatureJobListJSS'

interface IProps extends WithStyles<typeof styles> {
  history: any
}

const Welcome = (props: IProps) => {
  const [data, setData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [openTagsDialog, setOpenTagsDialog] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedItemForTags, setSelectedItemForTags] = useState(null)
  const [tags, setTags] = useState<ITag[]>([])
  const [owners, setOwners] = useState<IOwner[]>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [expandAllRows, setExpandAllRows] = useState(false)
  const [tableColumnConfig, setTableColumnConfig] = useState<IColumnConfig[]>(
    []
  )
  const [appliedFilters, setAppliedFilters] = useState<IFilters>({
    owners: [],
    tags: []
  })
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [filterSearchInput, setFilterSearchInput] = useState('')
  const [noResultsFound, setNoResultsFound] = useState(false)
  const [isFilteredResponse, setIsFilteredResponse] = useState(false)

  const {classes} = props
  const {
    output: {response: filtersResponse, loading: filtersLoading},
    triggerGQLCall: triggerFiltersGQLCall
  } = useGQL<null, FetchAllFilters>()

  const {
    output: {
      response: featureGroupsFilteredResponse,
      loading: featureGroupsFilteredLoading
    },
    triggerGQLCall: triggerFeatureGroupsFilteredGQLCall
  } = useGQL<FetchFilteredFeatureGroupsInput, FetchFilteredFeatureGroups>()

  const {
    output: {response: featureJobByIdResponse, loading: featureJobByIdLoading},
    triggerGQLCall: triggerFeatureJobByIdGQLCall
  } = useGQL<FetchFeatureJobsByIdInput, FetchFeatureJobsById>()

  const onTagClicked = (e, item) => {
    e.stopPropagation()
    setSelectedItemForTags(item)
    setOpenTagsDialog(true)
  }

  const triggerFeatureGroupsFilteredGQLCallDebounced = useMemo(
    () => debounce(triggerFeatureGroupsFilteredGQLCall),
    []
  )

  const onExpandAllRowsToggle = (e: MouseEvent) => {
    e.stopPropagation()
    const newExpandAllRows = !expandAllRows
    const dataCopy = [...data]
    dataCopy.forEach((d) => (d.open = newExpandAllRows))
    setData(dataCopy)
    setExpandAllRows(newExpandAllRows)
  }

  useEffect(() => {
    const columnConfig = getColumnConfig(
      classes,
      onTagClicked,
      expandAllRows,
      onExpandAllRowsToggle
    )
    setTableColumnConfig(columnConfig)
  }, [expandAllRows, data])

  useEffect(() => {
    triggerFiltersGQLCall(
      {
        ...filterListGql
      },
      FetchAllFiltersSchema
    )
  }, [])

  const isFiltersActive = () => {
    return appliedFilters.owners.length > 0 || appliedFilters.tags.length > 0
      ? true
      : false
  }

  const isSearchInputPresent = () => {
    return searchInput.trim().length > 0
  }

  const getOwnersForFilterAPICall = () => {
    return appliedFilters.owners.map((owner) => owner.name)
  }

  const getTagsForFilterAPICall = () => {
    return appliedFilters.tags.map((tag) => tag.name)
  }

  useEffect(() => {
    setNoResultsFound(false)
  }, [featureGroupsFilteredLoading])

  useEffect(() => {
    const variables = {
      pageSize: limit,
      offset,
      query: searchInput,
      ownerEmail: getOwnersForFilterAPICall(),
      tags: getTagsForFilterAPICall(),
      sortBy: 'version',
      order: 'desc'
    }
    triggerFeatureGroupsFilteredGQLCallDebounced(
      {
        ...fetchFilteredFeatureGroupsGql,
        variables
      },
      FetchFilteredFeatureGroupsSchema
    )
  }, [searchInput, appliedFilters, offset, limit])

  useEffect(() => {
    if (featureGroupsFilteredResponse) {
      const processedAPIData = processFilteredFeatureJobsAPIRes(
        featureGroupsFilteredResponse?.fetchFilteredFeatureGroups?.data
          ?.featureGroups
      )
      setIsFilteredResponse(true)
      setData(processedAPIData)
      setTotalRows(
        featureGroupsFilteredResponse?.fetchFilteredFeatureGroups?.data
          ?.totalResults
      )
      if (processedAPIData.length === 0) {
        setNoResultsFound(true)
      } else {
        setNoResultsFound(false)
      }
    }
  }, [featureGroupsFilteredResponse])

  useEffect(() => {
    if (filtersResponse) {
      const tags: ITag[] = []
      const owners: IOwner[] = []
      filtersResponse.fetchAllFilters.data.tags.forEach((tag) =>
        tags.push({name: tag, selected: false})
      )

      filtersResponse.fetchAllFilters.data.owners.forEach((owner) =>
        owners.push({name: owner, selected: false})
      )
      setTags(tags)
      setOwners(owners)
    }
  }, [filtersResponse])

  useEffect(() => {
    if (featureJobByIdResponse) {
      const featureJobs = featureJobByIdResponse.fetchFeatureJobsById.response
      const dataCopy = [...data]
      const originalFeatureJob = dataCopy.find(
        (r) => r.featureJobId === featureJobs[0].featureJobId
      )

      originalFeatureJob.loadingVersions = false
      featureJobs.forEach((job, idx) => {
        if (job.version !== originalFeatureJob.versions[0].version) {
          originalFeatureJob.versions[idx] = {
            version: job.version,
            status: job.state,
            description: job.descriptions,
            tags: job.tags,
            schedule: job.schedule,
            dateCreated: new Date(job.createdAt).toUTCString(),
            createdBy: job.owner
          }
        }
      })
      setData(dataCopy)
    }
  }, [featureJobByIdResponse])

  const processFilteredFeatureJobsAPIRes = (dataList) => {
    const processedAPIData = []
    for (const data of dataList) {
      const dataRow = {
        title: data.name,
        open: false,
        loadingVersions: false,
        versions: [
          {
            version: data.version,
            status: data.status,
            description: data.description,
            tags: data.tags,
            dateCreated: new Date(data.createdDate).toUTCString(),
            createdBy: data.ownerEmail
          }
        ],
        expandRows: (
          <ExpandMoreIcon className={classes.expandIcon}></ExpandMoreIcon>
        )
      }

      processedAPIData.push(dataRow)
    }

    return processedAPIData
  }

  const onExapndItem = (index: number) => {
    const dataCopy = [...data]
    dataCopy[index].open = !dataCopy[index].open

    if (dataCopy[index].open && dataCopy[index].versions.length === 1) {
      const variables = {
        featureJobId: dataCopy[index].featureJobId
      }
      dataCopy[index].loadingVersions = true
      const currentVersion = +dataCopy[index].versions[0].version
      for (let i = currentVersion - 1; i >= 1; i--) {
        dataCopy[index].versions.push({
          version: null,
          status: null,
          description: null,
          tags: [],
          schedule: null,
          dateCreated: null,
          createdBy: null
        })
      }
      triggerFeatureJobByIdGQLCall(
        {...featureJobByIdGql, variables},
        FetchFeatureJobsByIdSchema
      )
    }
    setData(dataCopy)
  }

  const onSearchInputChange = (input: string): void => {
    setSearchInput(input)
  }

  const onFilterBtnClicked = () => {
    setOpenFilterDialog(!openFilterDialog)
  }

  const onOpenFilterDialogChange = (value: boolean) => {
    setOpenFilterDialog(value)
  }

  const onOpenTagsDialogChange = (value: boolean) => {
    setOpenTagsDialog(value)
  }

  const onSortClicked = () => {
    if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else {
      setSortOrder('asc')
    }
  }

  const onShowAllTagsToggle = () => {
    setShowAllTags(!showAllTags)
  }

  const onFilterClicked = (type, name) => {
    if (type === TAG) {
      const tagsCopy = [...tags]
      const index = tagsCopy.findIndex((tag) => tag.name === name)
      tagsCopy[index].selected = !tagsCopy[index].selected
      setTags(tagsCopy)
    } else if (type === OWNER) {
      const ownersCopy = [...owners]
      const index = ownersCopy.findIndex((owner) => owner.name === name)
      ownersCopy[index].selected = !owners[index].selected
      setOwners(ownersCopy)
    }
  }

  const onApplyFilterClicked = () => {
    const selectedOwners = owners.filter((owner) => owner.selected)
    const selectedTags = tags.filter((tag) => tag.selected)
    const appliedFilters = {
      owners: selectedOwners,
      tags: selectedTags
    }
    setAppliedFilters(appliedFilters)
    onOpenFilterDialogChange(false)
  }

  const removeAppliedFilters = (filter: IFilters) => {
    const selectedOwners = filter.owners.filter((owner) => owner.selected)
    const selectedTags = filter.tags.filter((tag) => tag.selected)
    const appliedFilters = {
      owners: selectedOwners,
      tags: selectedTags
    }
    setAppliedFilters(appliedFilters)
  }

  const onFillterRemoveClicked = (type: string, filter: IOwner | ITag) => {
    if (type === OWNER) {
      const ownersCopy = [...owners]
      const index = owners.findIndex((owner) => owner.name === filter.name)
      ownersCopy[index].selected = !ownersCopy[index].selected
      setOwners(ownersCopy)
      removeAppliedFilters({owners: ownersCopy, tags: tags})
    } else if (type === TAG) {
      const tagsCopy = [...tags]
      const index = tags.findIndex((tag) => tag.name === filter.name)
      tagsCopy[index].selected = !tagsCopy[index].selected
      setTags(tagsCopy)
      removeAppliedFilters({owners: owners, tags: tagsCopy})
    }
  }

  const onAllFiltersRemoved = () => {
    const ownersCopy = [...owners]
    const tagsCopy = [...tags]
    ownersCopy.forEach((owner) => (owner.selected = false))
    tagsCopy.forEach((tag) => (tag.selected = false))
    setOwners(ownersCopy)
    setTags(tagsCopy)
    removeAppliedFilters({owners: [], tags: []})
  }

  const handleFeatureItemClick = (
    _: React.MouseEvent,
    id: string,
    featureJob
  ) => {
    const {version, title} = featureJob
    props.history.push(
      `${routes.featureJobDetailsPage
        .replace(':featureGroupName', title)
        .replace(':version', version)}`
    )
  }

  const onFilterSearched = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilterSearchInput(e.target.value)
  }

  const clearAllFilters = () => {
    const ownersCopy = [...owners]
    const tagsCopy = [...tags]

    ownersCopy.forEach((owner) => (owner.selected = false))
    tagsCopy.forEach((tag) => (tag.selected = false))

    setOwners(ownersCopy)
    setTags(tagsCopy)
  }

  const onPageChange = (page, rowsPerPage) => {
    setOffset(page * rowsPerPage)
  }

  const onPageSizeChange = (newPageSize) => {
    setLimit(newPageSize)
  }

  return (
    <div className={classes.container}>
      <div>
        <Typography variant='h6' mt={0} mb={2}>
          Feature Store
        </Typography>
      </div>
      <SearchAndFilter
        appliedFilters={appliedFilters}
        owners={owners}
        tags={tags}
        searchInput={searchInput}
        onSearchInputChange={onSearchInputChange}
        onFilterBtnClick={onFilterBtnClicked}
        openFilterDialog={openFilterDialog}
        onOpenFilterDialogChange={onOpenFilterDialogChange}
        showAllTags={showAllTags}
        onShowAllTagsToggle={onShowAllTagsToggle}
        onFilterClicked={onFilterClicked}
        onApplyFilterClicked={onApplyFilterClicked}
        onFillterRemoveClicked={onFillterRemoveClicked}
        onAllFiltersRemoved={onAllFiltersRemoved}
        filterSearchInput={filterSearchInput}
        onFilterSearched={onFilterSearched}
        clearAllFilters={clearAllFilters}
      />
      <DataList
        data={data}
        stickyHeader={true}
        columnConfig={tableColumnConfig}
        order={sortOrder}
        singleSelection={false}
        shouldEnableSelection={false}
        rowsPerPageOptions={[10, 50, 100]}
        rowsPerPage={10}
        showEmptyRows={false}
        totalCount={totalRows}
        collapsable={true}
        loader={featureGroupsFilteredLoading}
        onClick={handleFeatureItemClick}
        collapsableColumn={'versions'}
        onExapndItem={onExapndItem}
        onRequestSort={onSortClicked}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        noResultsFound={noResultsFound}
        enablePagination={true}
        isFilteredResponse={isFilteredResponse}
      />
      {selectedItemForTags ? (
        <DisplayTagsDialog
          item={selectedItemForTags}
          openTagsDialog={openTagsDialog}
          onOpenTagsDialogChange={onOpenTagsDialogChange}
        />
      ) : null}
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(Welcome)

export default styleComponent
