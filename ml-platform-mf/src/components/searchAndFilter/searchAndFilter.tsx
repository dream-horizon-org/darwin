import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {Button, FormControl, OutlinedInput} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {compose} from 'redux'

import {IFilters, IOwner, ITag, OWNER} from '../../types/filters.type'
import AppliedFilters from './appliedFilters/appliedFilters'
import FilterDialog from './filterDialog/filterDialog'
import styles from './searchAndFilterJSS'

interface IProps extends WithStyles<typeof styles> {
  owners: IOwner[]
  tags: ITag[]
  searchInput: string
  onSearchInputChange: (input: string) => void
  onFilterBtnClick: () => void
  openFilterDialog: boolean
  onOpenFilterDialogChange: (value: boolean) => void
  showAllTags?: boolean
  onShowAllTagsToggle: () => void
  appliedFilters: IFilters
  onFilterClicked: (type, index) => void
  onApplyFilterClicked: () => void
  onFillterRemoveClicked: (type: string, filter: IOwner | ITag) => void
  onAllFiltersRemoved: () => void
  filterSearchInput: string
  onFilterSearched: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void
  clearAllFilters: () => void
}

const SearchAndFilter = (props: IProps) => {
  const {classes} = props

  const isAnyFilterApplied = (filters: IFilters): boolean => {
    return filters.owners.length > 0
      ? true
      : filters.tags.length > 0
      ? true
      : false
  }

  return (
    <div className={classes.searchAndFilter}>
      <div className={classes.searchAndFilterBox}>
        <FormControl fullWidth variant='outlined' size='small'>
          <OutlinedInput
            id='outlined-adornment-amount'
            endAdornment={<SearchIcon />}
            placeholder='Search By Title...'
            value={props.searchInput}
            onChange={(e) => props.onSearchInputChange(e.target.value)}
            classes={{
              root: classes.customTextField
            }}
          />
        </FormControl>
        <Button
          variant='outlined'
          color='primary'
          className={`${classes.button} ${classes.filterBtn}`}
          onClick={props.onFilterBtnClick}
        >
          <FilterListIcon color='primary' />
        </Button>
      </div>
      {isAnyFilterApplied(props.appliedFilters) && (
        <AppliedFilters
          appliedFilters={props.appliedFilters}
          onFillterRemoveClicked={props.onFillterRemoveClicked}
          onAllFiltersRemoved={props.onAllFiltersRemoved}
        />
      )}
      <FilterDialog
        owners={props.owners}
        tags={props.tags}
        showAllTags={props.showAllTags}
        onShowAllTagsToggle={props.onShowAllTagsToggle}
        openFilterDialog={props.openFilterDialog}
        onOpenFilterDialogChange={props.onOpenFilterDialogChange}
        onFilterClicked={props.onFilterClicked}
        onApplyFilterClicked={props.onApplyFilterClicked}
        filterSearchInput={props.filterSearchInput}
        onFilterSearched={props.onFilterSearched}
        clearAllFilters={props.clearAllFilters}
      />
    </div>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  SearchAndFilter
)

export default styleComponent
