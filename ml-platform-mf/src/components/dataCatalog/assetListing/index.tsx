import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {compose} from 'redux'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {useCatalogStore} from '../../../modules/catalog/store/catalogStore'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import AssetTree from '../assetTree/index'
import QuerySearch from '../assetTree/querySearch'
import {DEFAULT_NAME, DEFAULT_PREFIX, QUERY_SEARCH_CONSTANTS} from '../constant'
import SearchAssets from '../searchAssets/index'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  handleExtendDrawer: () => void
  setAssetClicked: (assetClicked: SelectionOnData) => void
  assetClicked: SelectionOnData
}

const offset = 0
const pageSize = 20
const depth = 2
const DEFAULT_PREFIX_SLICE = DEFAULT_PREFIX.slice(1, -1)

const AssetListing = (props: IProps) => {
  const {PAGE_SIZE} = QUERY_SEARCH_CONSTANTS
  const {classes, handleExtendDrawer, setAssetClicked, assetClicked} = props
  const {
    searchAssets,
    searchAssetsAction,
    resetSearchAssets,
    resetQuerySearchAssets,
    querySearchAssets,
    querySearchAssetsData,
    searchQuery,
    setSearchQuery
  } = useCatalogStore()

  const debouncedSetSearchQuery = useCallback(
    debounce((value) => {
      setSearchQuery(value)
    }, 500),
    []
  )

  const searchAssetsActionFunc = () => {
    searchAssetsAction(DEFAULT_PREFIX_SLICE, {
      asset_name_regex: DEFAULT_NAME,
      asset_prefix_regex: DEFAULT_PREFIX,
      page_size: pageSize,
      offset: offset,
      depth: depth
    })
  }

  useEffect(() => {
    if (!searchAssets[DEFAULT_PREFIX_SLICE]) {
      searchAssetsActionFunc()
    }
  }, [depth])

  const handleRefreshClick = () => {
    if (!searchQuery) {
      resetSearchAssets()
      searchAssetsActionFunc()
    } else {
      resetQuerySearchAssets()
      querySearchAssets(
        {
          asset_name_regex: searchQuery,
          asset_prefix_regex: DEFAULT_PREFIX,
          page_size: PAGE_SIZE,
          offset: offset,
          depth: null
        },
        null
      )
    }
  }

  return (
    <div className={classes.root}>
      <SearchAssets
        handleSearch={debouncedSetSearchQuery}
        handleRefreshClick={handleRefreshClick}
        isReloading={
          searchAssets[DEFAULT_PREFIX_SLICE]?.status === API_STATUS.LOADING
        }
      />
      <div className={classes.assetListingContainer}>
        {searchQuery ? (
          <QuerySearch
            handleExtendDrawer={handleExtendDrawer}
            setAssetClicked={setAssetClicked}
            assetClicked={assetClicked}
          />
        ) : (
          <AssetTree
            data={searchAssets[DEFAULT_PREFIX_SLICE]?.data}
            parentPrefix={DEFAULT_PREFIX_SLICE}
            depth={0}
            handleExtendDrawer={handleExtendDrawer}
            setAssetClicked={setAssetClicked}
            assetClicked={assetClicked}
            isReloading={
              searchAssets[DEFAULT_PREFIX_SLICE]?.status === API_STATUS.LOADING
            }
          />
        )}
      </div>
    </div>
  )
}

export default compose<any>(withStyles(styles))(AssetListing)
