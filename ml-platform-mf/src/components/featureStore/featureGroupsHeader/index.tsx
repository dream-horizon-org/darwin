import {TabContext, TabList} from '@material-ui/lab'
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs
} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory, useLocation} from 'react-router'
import {compose} from 'redux'
import {routes} from '../../../constants'
import {SelectionOnData as FeatureGroupFilters} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupFilters'
import {getFeatureGroupFilters} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupFilters/index.thunk'
import {
  GetFeatureGroups,
  GetFeatureGroupsInput
} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroups'
import {getFeatureGroups} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroups/index.thunk'
import {GetFeatureGroupsCountInput} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupsCount'
import {getFeatureGroupsCount} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupsCount/index.thunk'
import {CommonState} from '../../../reducers/commonReducer'
import {aliasTokens} from '../../../theme.contants'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import FilterDrop from '../../filterDrop'
import SearchBar from '../../searchBar'
import useQuery, {featureStoreQueryParams, QueryParams} from '../../useQuery'
import {
  pageResultCount,
  searchInputPlaceholder,
  sortingOptions
} from './constants'
import styles from './indexJSS'

enum FeatureStoreType {
  on = 'on',
  off = 'off'
}

export interface IFeatureGroupFiltersValues {
  [key: string]: boolean
}

export interface IFeatureGroupFilters {
  name: FeatureGroupFilters['name']
  values: IFeatureGroupFiltersValues
}

export type FormatQueryParams = {
  [key: string]: string[]
}

interface IProps extends WithStyles<typeof styles> {
  getFeatureGroupsFunc: (
    payload: GetFeatureGroupsInput,
    preLoadedData: GetFeatureGroups['getFeatureGroups']['data']
  ) => void
  getFeatureGroupFiltersFunc: () => void
  resetPageNumber: () => void
  featureGroups: CommonState['featureGroupsReducer']['featureGroups']
  featureGroupPageNumber: number
  featureGroupFilters: {
    status: API_STATUS
    data: FeatureGroupFilters[]
    error: any
  }
  getFeatureGroupsCount: (payload: GetFeatureGroupsCountInput) => void
  featureGroupsCount: CommonState['featureGroupsReducer']['featureGroupsCount']
}

const FeatureGroupsHeader = (props: IProps) => {
  const {
    classes,
    getFeatureGroupsFunc,
    getFeatureGroupFiltersFunc,
    featureGroups,
    featureGroupPageNumber,
    resetPageNumber,
    featureGroupFilters,
    getFeatureGroupsCount,
    featureGroupsCount
  } = props
  const query = useQuery()
  const history = useHistory()
  const featureStoreType = query.get(QueryParams.TYPE)
  const getFeatureGroupsFuncDebounced = useMemo(
    () => debounce(getFeatureGroupsFunc),
    []
  )
  const getFeatureGroupsCountDebounced = useMemo(
    () => debounce(getFeatureGroupsCount),
    []
  )

  const searchQuery = query.get(QueryParams.QUERY) || ''
  const filterQueryParam = query.get(featureStoreQueryParams.FILTERS) || ''

  const getfilterQueryParams = () => {
    const parsedFilter = JSON.parse(filterQueryParam)
    return Object.keys(parsedFilter).map((filterName) => {
      return {
        name: filterName,
        value: parsedFilter[filterName]
      }
    })
  }

  const [sortingValue, setSortingValue] = React.useState(sortingOptions[0])

  const [tabValue, setTabValue] = useState<FeatureStoreType>(
    FeatureStoreType[featureStoreType] || FeatureStoreType.on
  )

  const [filters, setFilters] = useState<IFeatureGroupFilters[]>([])
  const [filtersQuery, setFiltersQuery] = useState<
    GetFeatureGroupsInput['filters']
  >(filterQueryParam ? getfilterQueryParams() : [])

  const onSearchInput = (str) => {
    history.replace({
      pathname: routes.featureGroupList,
      search: `?${QueryParams.QUERY}=${encodeURIComponent(str)}&${
        QueryParams.TYPE
      }=${tabValue}&${featureStoreQueryParams.FILTERS}=${encodeURIComponent(
        filterQueryParam
      )}`
    })
  }

  const getSortByValue = (sortingOptionValue: string) => {
    if (sortingOptionValue === 'nameAsc' || sortingOptionValue === 'nameDesc') {
      return 'name'
    } else {
      return sortingOptionValue
    }
  }

  const getSortByOrder = (sortingOptionValue: string) => {
    if (sortingOptionValue === 'nameDesc') {
      return 'desc'
    } else {
      return 'asc'
    }
  }

  useEffect(() => {
    getFeatureGroupFiltersFunc()
  }, [])

  useEffect(() => {
    setTabValue(FeatureStoreType[featureStoreType] || FeatureStoreType.on)
  }, [featureStoreType])

  useEffect(() => {
    if (featureGroupFilters.status === API_STATUS.SUCCESS) {
      const defaultFilters: IFeatureGroupFilters[] =
        featureGroupFilters.data.map((filter) => ({
          name: filter.name,
          values: filter.value.reduce(
            (acc, v, vi) =>
              Object.assign(acc, {
                [v]: false
              }),
            {}
          )
        }))
      if (filterQueryParam) {
        const featureStorefiltersQueryVal: FormatQueryParams =
          JSON.parse(filterQueryParam)
        const retainedFilters = {}
        Object.keys(featureStorefiltersQueryVal).forEach((currKey) => {
          const values = {}
          featureStorefiltersQueryVal[currKey].forEach((value) => {
            values[value] = true
          })
          retainedFilters[currKey] = values
        })
        const updatedFilters = defaultFilters.map((currentVal, idx) => {
          return {
            ...currentVal,
            values: {...currentVal.values, ...retainedFilters[currentVal.name]}
          }
        })
        setFilters(updatedFilters)
      } else setFilters(defaultFilters)
    }
  }, [featureGroupFilters.status, filterQueryParam])

  useEffect(() => {
    resetPageNumber()
    featureGroups.cancel && featureGroups.cancel()
    getFeatureGroupsFuncDebounced(
      {
        filters: filtersQuery,
        offset: 0,
        pageSize: pageResultCount,
        searchString: searchQuery,
        sortBy: getSortByValue(sortingValue.value),
        sortOrder: getSortByOrder(sortingValue.value),
        type: tabValue === FeatureStoreType.on ? 'online' : 'offline'
      },
      []
    )
  }, [searchQuery])

  useEffect(() => {
    resetPageNumber()
    featureGroups.cancel && featureGroups.cancel()
    getFeatureGroupsFunc(
      {
        filters: filtersQuery,
        offset: 0,
        pageSize: pageResultCount,
        searchString: searchQuery,
        sortBy: getSortByValue(sortingValue.value),
        sortOrder: getSortByOrder(sortingValue.value),
        type: tabValue === FeatureStoreType.on ? 'online' : 'offline'
      },
      []
    )
  }, [tabValue, filtersQuery, sortingValue])

  useEffect(() => {
    const payload = {
      searchString: searchQuery,
      filters: filtersQuery
    }
    getFeatureGroupsCountDebounced(payload)
  }, [filtersQuery, searchQuery])

  useEffect(() => {
    if (featureGroupPageNumber)
      getFeatureGroupsFunc(
        {
          filters: filtersQuery,
          offset: featureGroupPageNumber * pageResultCount,
          pageSize: pageResultCount,
          searchString: searchQuery,
          sortBy: getSortByValue(sortingValue.value),
          sortOrder: getSortByOrder(sortingValue.value),
          type: tabValue === FeatureStoreType.on ? 'online' : 'offline'
        },
        [...(featureGroups.data || [])]
      )
  }, [featureGroupPageNumber])

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabValue: FeatureStoreType
  ) => {
    setTabValue(newTabValue)
    resetPageNumber()
    history.replace({
      pathname: routes.featureGroupList,
      search: `?${QueryParams.QUERY}=${encodeURIComponent(searchQuery)}&${
        QueryParams.TYPE
      }=${newTabValue}&${featureStoreQueryParams.FILTERS}=${encodeURIComponent(
        filterQueryParam
      )}`
    })
  }

  const selectFilters = (fIdx: number, fValues: IFeatureGroupFiltersValues) => {
    const newFilters = [...filters]
    newFilters[fIdx].values = fValues
    setFilters(newFilters)
    setFiltersQuery(
      newFilters
        .map((filter) => ({
          name: filter.name,
          value: Object.keys(filter.values).reduce(
            (acc, curr) => (filter.values[curr] ? [...acc, curr] : acc),
            []
          )
        }))
        .reduce((acc, curr) => (curr.value.length ? [...acc, curr] : acc), [])
    )

    const copyNewFilters = [...newFilters]
    const filterUrlQueryParams: FormatQueryParams = copyNewFilters?.reduce(
      (acc: FormatQueryParams, curr) => {
        const selectedFilters = Object.keys(curr.values).filter(
          (val) => curr.values[val]
        )
        if (acc[curr.name]) {
          acc[curr.name] = [...acc[curr.name], ...selectedFilters]
        } else {
          acc[curr.name] = selectedFilters
        }
        return acc
      },
      {}
    )
    const filterStr = JSON.stringify(filterUrlQueryParams)
    history.replace({
      pathname: routes.featureGroupList,
      search: `?${QueryParams.QUERY}=${encodeURIComponent(searchQuery)}&${
        QueryParams.TYPE
      }=${tabValue}&${featureStoreQueryParams.FILTERS}=${encodeURIComponent(
        filterStr
      )}`
    })
  }

  const handleChange = (event: SelectChangeEvent) => {
    const sortingConfig = sortingOptions.find(
      (option) => option.value === event.target.value
    )
    if (sortingConfig) {
      setSortingValue(sortingConfig)
    }
  }
  return (
    <div className={classes.container}>
      <div className={classes.row1}>
        <div className={classes.searchContainer}>
          <SearchBar
            placeholder={searchInputPlaceholder}
            value={searchQuery || ''}
            onValueChange={onSearchInput}
            dataTestestid='feature-store-search-bar'
          />
        </div>
        <div className={classes.filterContainer}>
          <span className={classes.filterTitle}>Filter By:</span>
          {featureGroupFilters.status === API_STATUS.LOADING ? (
            <span className={classes.filterByText}>Loading filters...</span>
          ) : null}
          {featureGroupFilters.status === API_STATUS.ERROR ? (
            <span className={classes.filterByText}>
              Failed to load filters!
            </span>
          ) : null}
          {featureGroupFilters.status === API_STATUS.SUCCESS
            ? filters.map((filter, fIdx) => (
                <Box key={filter.name} sx={{marginLeft: '8px'}}>
                  <FilterDrop
                    selectFilters={(f) => selectFilters(fIdx, f)}
                    data={filter}
                    dataTestId={`filter-drop-${filter.name}`}
                  />
                </Box>
              ))
            : null}
        </div>
      </div>
      <div className={classes.row2}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: aliasTokens.disabled_border_color,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='lab API tabs example'
            sx={{backgroundColor: aliasTokens.primary_background_color}}
          >
            <Tab
              label={'Online'}
              value={FeatureStoreType.on}
              icon={
                <span className={classes.tabIcon}>
                  {featureGroupsCount?.data?.onlineCount || 0}
                </span>
              }
              iconPosition={'end'}
              data-testid='online-tab-button'
            />
            <Tab
              label={'Offline'}
              value={FeatureStoreType.off}
              icon={
                <span className={classes.tabIcon}>
                  {featureGroupsCount?.data?.offlineCount || 0}
                </span>
              }
              iconPosition={'end'}
              data-testid='offline-tab-button'
            />
          </Tabs>
          <FormControl
            variant='standard'
            sx={{minWidth: 120, mb: '9px'}}
            className={classes.sortingDrop}
          >
            <Select
              sx={{
                ':after': {
                  borderBottom: 'none'
                },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: 'none'
                },
                borderBottom: 'none',
                '&:before': {
                  borderBottom: 'none'
                },
                '&:hover': {
                  borderBottom: 'none'
                },
                '& .MuiSelect-select': {
                  color: `${aliasTokens.neutral_text_color} !important`,
                  fontWeight: 600,
                  fontSize: '12px'
                },
                '& .MuiSvgIcon-root': {
                  color: aliasTokens.neutral_text_color
                }
              }}
              MenuProps={{
                classes: {paper: classes.dropdownStyle},
                variant: 'menu'
              }}
              value={sortingValue.value}
              onChange={handleChange}
            >
              {sortingOptions.map((s) => (
                <MenuItem
                  className={sortingValue.value === s.value && 'active'}
                  value={s.value}
                >
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroupFilters: state.featureGroupsReducer.featureGroupFilters,
  featureGroups: state.featureGroupsReducer.featureGroups,
  featureGroupsCount: state.featureGroupsReducer.featureGroupsCount
})

const mapDispatchToProps = (dispatch) => {
  return {
    getFeatureGroupFiltersFunc: () => getFeatureGroupFilters(dispatch),
    getFeatureGroupsFunc: (
      payload: GetFeatureGroupsInput,
      preLoadedData: GetFeatureGroups['getFeatureGroups']['data']
    ) => getFeatureGroups(dispatch, payload, preLoadedData),
    getFeatureGroupsCount: (payload: GetFeatureGroupsCountInput) =>
      getFeatureGroupsCount(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(FeatureGroupsHeader)

export default StyleComponent
