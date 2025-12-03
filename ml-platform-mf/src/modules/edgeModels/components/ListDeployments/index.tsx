import {withStyles} from '@mui/styles'
import React, {useState} from 'react'
import {useHistory} from 'react-router'
import {Checkbox} from '../../../../bit-components/checkbox/index'
// import FilterDrop from '../../../../components/filterDrop'
import SearchBar from '../../../../components/searchBar'
import useQuery from '../../../../components/useQuery'
import {routes} from '../../../../constants'
import {
  DeploymentStatusTypes,
  EdgeModelsQueryParams
} from '../../data/constants'
import {getHistorySearchObj} from '../../data/utils'
import {ModelHeaderComponent} from '../ListDeployments/ModelHeader'
import {ModelTable} from '../ListDeployments/ModelTable'
import styles from './indexJSS'

const defaultFilters = [
  {
    name: 'Status',
    values: {
      [DeploymentStatusTypes.READY]: false,
      [DeploymentStatusTypes.FAILED]: false,
      [DeploymentStatusTypes.DEPLOYING]: false,
      [DeploymentStatusTypes.TESTING]: false,
      [DeploymentStatusTypes.DEPLOYED]: false,
      [DeploymentStatusTypes.READY_TO_TEST]: false
    }
  },
  {
    name: 'User',
    values: {
      'user@example.com': false,
      'all@all.com': false
    }
  }
]

const EdgeModelsPage = (props) => {
  const {classes} = props
  const query = useQuery()
  const history = useHistory()
  const [filters, setFilters] = useState(defaultFilters)
  const [urlQueryParams, setUrlQueryParams] = useState({})

  const [checked, setChecked] = useState(false)

  const searchQuery = query.get(EdgeModelsQueryParams.QUERY) || ''

  const onSearchInput = (str: string) => {
    const newUrlQueryParams = {...urlQueryParams}
    if (!str) {
      delete newUrlQueryParams[EdgeModelsQueryParams.QUERY]
    } else {
      newUrlQueryParams[EdgeModelsQueryParams.QUERY] = str
    }
    const obj = getHistorySearchObj(newUrlQueryParams, routes.edgeModels)
    setUrlQueryParams(newUrlQueryParams)
    history.replace(obj)
  }

  const onCheckboxChange = (e) => {
    const user_email = JSON.parse(localStorage.getItem('x-user-details')).email
    const newUrlQueryParams = {...urlQueryParams}
    if (!e.target.checked) {
      delete newUrlQueryParams[EdgeModelsQueryParams.FILTERS].owned_by_me
    } else {
      newUrlQueryParams[EdgeModelsQueryParams.FILTERS] = {
        ...newUrlQueryParams[EdgeModelsQueryParams.FILTERS],
        owned_by_me: [user_email]
      }
    }
    const obj = getHistorySearchObj(newUrlQueryParams, routes.edgeModels)
    setUrlQueryParams(newUrlQueryParams)
    setChecked(e.target.checked)
    history.replace(obj)
  }

  const selectFilters = (fIdx: number, fValues: any) => {
    const newFilters = [...filters]
    newFilters[fIdx].values = fValues
    setFilters(newFilters)

    const newFiltersQuery = {
      status: getFilterValuesForQuery('status'),
      owners: getFilterValuesForQuery('user')
    }
    const newUrlQueryParams = {...urlQueryParams}

    newUrlQueryParams[EdgeModelsQueryParams.FILTERS] = {
      ...newUrlQueryParams[EdgeModelsQueryParams.FILTERS],
      ...newFiltersQuery
    }

    const obj = getHistorySearchObj(newUrlQueryParams, routes.edgeModels)
    setUrlQueryParams(newUrlQueryParams)
    history.replace(obj)
  }

  const getFilterValuesForQuery = (type: string) => {
    const filterType = filters.find(
      (f) => f.name.toLowerCase() === type.toLowerCase()
    )
    return Object.keys(filterType?.values || []).filter(
      (f) => filterType?.values[f]
    )
  }

  return (
    <div className={classes.container}>
      <ModelHeaderComponent />

      <div className={classes.searchAndFilterRow}>
        <div className={classes.searchAndOwnedContainer}>
          <div className={classes.searchBar}>
            <SearchBar
              placeholder='Search By Name'
              value={searchQuery}
              onValueChange={onSearchInput}
            />
          </div>
          <div className={classes.checkBoxAndLabel}>
            <Checkbox checked={checked} onChange={onCheckboxChange} />
            <div>{'Owned by me'}</div>
          </div>
        </div>
        {/* <div className={classes.filterContainer}>
          <span className={classes.filterByText}>Filter By:</span>
          {filters.map((filter, fIdx) => (
            <Box key={filter.name} sx={{marginLeft: '8px'}}>
              <FilterDrop
                selectFilters={(f) => selectFilters(fIdx, f)}
                data={filter}
              />
            </Box>
          ))}
        </div> */}
      </div>
      <ModelTable />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(EdgeModelsPage)

export default StyleComponent
