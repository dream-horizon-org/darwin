import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import React, {useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {Button} from '../../bit-components/button/index'
import {Icons} from '../../bit-components/icon/index'
import {Search} from '../../bit-components/search/index'
import SearchBar from '../../components/searchBar'

import {Chip} from '../../bit-components/chip/index'
// import {ComputeQueryParams} from '../../components/useQuery'
import FilterDrop from '../../components/filterDrop'
import {routes} from '../../constants'
import {useQueryParams} from '../../hooks/src/useQueryParams.hooks'
import styles from './computeSearchAndCreateJSS'
import {createBtnText, searchInputPlaceholder} from './constants'

interface IProps extends WithStyles<typeof styles> {
  searchQuery: string
  onSearchInput: (value: string) => void
  setFilterByMe: (value: boolean) => void
  filterByMe: boolean
  filters: {
    status: string[]
  }
  setFilters: (value: {status: string[]}) => void
}

const ComputeSearchAndCreate = (props: IProps) => {
  const {
    classes,
    searchQuery,
    onSearchInput,
    setFilterByMe,
    filterByMe,
    filters,
    setFilters
  } = props
  const history = useHistory()
  const [query, setQueryParams] = useQueryParams()

  const onCreateClusterClickHandler = () => {
    history.push(`${routes.clusterCreatePage}`)
  }

  // const filterByChange = () => {
  //   setQueryParams({
  //     searchStr: `${ComputeQueryParams.QUERY}=${searchQuery}&${
  //       ComputeQueryParams.FILTERS
  //     }=${!filterByMe}`
  //   })
  //   setFilterByMe(!filterByMe)
  // }
  const activeInactiveFilterData = useMemo(() => {
    return {
      active: filters.status.includes('active'),
      inactive: filters.status.includes('inactive')
    }
  }, [filters])

  return (
    <div className={classes.container}>
      <div className={classes.search}>
        <SearchBar
          placeholder={searchInputPlaceholder}
          value={searchQuery}
          onValueChange={onSearchInput}
        />
      </div>
      <div className={classes.filtersContainer}>
        <span className={classes.filterByText}>Filter By: </span>
        <Chip
          selected={filterByMe}
          label='Created by me'
          // onClick={filterByChange}
          onClick={() => setFilterByMe(!filterByMe)}
        />
        <div className={classes.activeInactiveFilterContainer}>
          <FilterDrop
            data={{
              name: 'status',
              values: activeInactiveFilterData
            }}
            selectFilters={(f) => {
              let selectedStatus = []
              selectedStatus = Object.keys(f).filter((key) => {
                return f[key]
              })
              setFilters({
                ...filters,
                status: selectedStatus
              })
            }}
          />
        </div>
      </div>
      <div className={classes.createBtn}>
        <Button
          buttonText={createBtnText}
          onClick={onCreateClusterClickHandler}
          leadingIcon={Icons.ICON_ADD_OUTLINED}
        />
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  ComputeSearchAndCreate
)

export default styleComponent
