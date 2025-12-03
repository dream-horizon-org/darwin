import React, {useEffect, useState} from 'react'
import {Dropdown} from '../../../../bit-components/dropdown/index'
import SearchBar from '../../../../components/searchBar'

import {withStyles} from '@mui/styles'
import styles from './AllEventsListingHeaderJSS'

const AllEventsListingHeader = (props) => {
  const {classes, platforms, appVersions, handleFiltersAndSearch} = props

  const [filters, setFilters] = useState({
    appVersions: [],
    platform: platforms
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppVersion, setSelectedAppVersion] = useState({
    label: '',
    value: ''
  })
  const [selectedPlatform, setSelectedPlatform] = useState({
    label: '',
    value: ''
  })

  useEffect(() => {
    if (appVersions && appVersions.length > 0) {
      setFilters({
        ...filters,
        appVersions
      })
      setSelectedAppVersion({
        label: appVersions[0].semver,
        value: appVersions[0].id
      })
    }
  }, [appVersions])

  const onSearchInput = (str: string) => {
    setSearchQuery(str)
    handleFiltersAndSearch('query', str)
  }

  const handleFilterChange = (type, values) => {
    if (!values) {
      return
    }
    if (type === 'appVersion') {
      setSelectedAppVersion({
        label: values.label,
        value: values.value
      })
    } else {
      setSelectedPlatform({
        label: values.label,
        value: values.value
      })
    }
    handleFiltersAndSearch(type, values)
    setSearchQuery('')
  }

  const defaultAppVersion = {
    label: filters?.appVersions[0]?.semver || '',
    value: filters?.appVersions[0]?.id || ''
  }

  const defaultPlatform = {
    label: filters?.platform[0] || '',
    value: filters?.platform[0] || ''
  }

  return (
    <div className={classes.container}>
      <div className={classes.searchAndFilterRow}>
        <div className={classes.searchAndOwnedContainer}>
          <div className={classes.leftSearchFilter}>
            <SearchBar
              placeholder='Search By Event Name'
              value={searchQuery}
              onValueChange={onSearchInput}
            />
          </div>
        </div>
        <div className={classes.rightFilterContainer}>
          <span className={classes.filterByText}>Filter By:</span>
          {filters.appVersions.length > 0 && (
            <div className={classes.rightFilter}>
              <Dropdown
                onChange={(e, values) =>
                  handleFilterChange('appVersion', values)
                }
                menuLists={filters.appVersions.map((version) => {
                  return {label: version.semver, value: version.id}
                })}
                label={'App Versions'}
                inputValue={
                  selectedAppVersion?.label || defaultAppVersion?.label
                }
                dropDownValue={
                  selectedAppVersion.label
                    ? selectedAppVersion
                    : defaultAppVersion
                }
                disableClearable={true}
                fieldVariant='withOutline'
              />
            </div>
          )}
          <div className={classes.rightFilter}>
            <Dropdown
              onChange={(e, values) => handleFilterChange('platform', values)}
              label={'Platform'}
              menuLists={filters.platform.map((type) => {
                return {label: type, value: type.toLowerCase()}
              })}
              inputValue={selectedPlatform?.label || defaultPlatform?.label}
              dropDownValue={
                selectedPlatform.label ? selectedPlatform : defaultPlatform
              }
              disableClearable={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  AllEventsListingHeader
)

export default styleComponent
