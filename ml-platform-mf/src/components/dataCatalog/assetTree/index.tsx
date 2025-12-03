import {Tooltip as TooltipMUI} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import React, {useCallback, useEffect, useState} from 'react'
import {compose} from 'redux'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {
  SelectionOnData,
  SelectionOnSearchAssets
} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {useCatalogStore} from '../../../modules/catalog/store/catalogStore'
import {truncate} from '../../../utils/helper'
import AssetIcon from '../assetIcon'
import {DEFAULT_NAME, LOADER_NAME} from '../constant'
import {getTruncateLength} from '../utils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  data: SelectionOnSearchAssets
  depth?: number
  parentPrefix?: string // To identify the current level for pagination
  handleExtendDrawer: () => void
  setAssetClicked?: (assetClicked: SelectionOnData) => void
  assetClicked?: SelectionOnData
  isReloading: boolean
  selectedItemKey?: string // Add selected item tracking
  onItemSelect?: (itemKey: string | null) => void // Add selection handler
}

const PAGE_SIZE = 20
const OFFSET = 0
const SHELL_WIDTH = 300
const SHELL_HEIGHT = 40

const AssetTree = (props: IProps) => {
  const {
    classes,
    data,
    depth = 0,
    parentPrefix,
    handleExtendDrawer,
    setAssetClicked,
    isReloading,
    assetClicked,
    selectedItemKey,
    onItemSelect
  } = props

  const {
    searchAssets,
    searchAssetsAction,
    expandedItems,
    addExpandedItem,
    removeExpandedItem,
    resetExpandedItems
  } = useCatalogStore()

  const currentDataLength = data?.offset + data?.page_size
  const isLakehouse = (source: SelectionOnData) => {
    return source?.asset_prefix?.includes('lakehouse') && !source.is_terminal
      ? source.depth >= 3
      : source.depth > 3
  }

  const [internalSelectedItem, setInternalSelectedItem] = useState<
    string | null
  >(null)
  const isRootLevel = depth === 0
  const currentSelectedItem = isRootLevel
    ? internalSelectedItem
    : selectedItemKey

  const getItemKey = (source: SelectionOnData) =>
    `${source.asset_prefix}:${source.asset_name}`

  useEffect(() => {
    if (assetClicked?.asset_prefix && assetClicked?.asset_name) {
      const itemKey = getItemKey(assetClicked)
      if (isRootLevel) {
        setInternalSelectedItem(itemKey)
      } else if (onItemSelect) {
        onItemSelect(itemKey)
      }
    }
  }, [assetClicked])

  const handleItemSelect = isRootLevel ? setInternalSelectedItem : onItemSelect

  useEffect(() => {
    if (isReloading) {
      resetExpandedItems()
    }
  }, [isReloading, resetExpandedItems])

  const toggleExpanded = useCallback(
    (source: SelectionOnData) => {
      const itemKey = getItemKey(source)
      if (expandedItems.includes(itemKey)) {
        removeExpandedItem(itemKey)
      } else {
        addExpandedItem(itemKey)

        const nestedPrefix = `^${source.asset_prefix}:${source.asset_name}$`
        const storeKey = nestedPrefix.slice(1, -1)

        const existingData = searchAssets[storeKey]

        if (!existingData || !existingData.data) {
          searchAssetsAction(storeKey, {
            asset_name_regex: DEFAULT_NAME,
            asset_prefix_regex: nestedPrefix,
            page_size: PAGE_SIZE,
            offset: OFFSET,
            depth: source.depth + 1
          })
        }
      }
    },
    [
      expandedItems,
      searchAssets,
      addExpandedItem,
      removeExpandedItem,
      searchAssetsAction
    ]
  )

  const handleLoadMore = useCallback(() => {
    if (!data) return

    const currentKey = parentPrefix
    const currentOffset = data?.offset || 0
    const currentPageSize = PAGE_SIZE

    searchAssetsAction(currentKey, {
      asset_name_regex: DEFAULT_NAME,
      asset_prefix_regex: `^${currentKey}$`,
      page_size: currentPageSize,
      offset: currentOffset + currentPageSize,
      depth: data.data?.[0]?.depth || 0
    })
  }, [data, parentPrefix])

  const handleAssetClick = useCallback(
    (source: SelectionOnData) => {
      const itemKey = getItemKey(source)

      // Handle selection
      if (handleItemSelect) {
        handleItemSelect(currentSelectedItem === itemKey ? null : itemKey)
      }

      setAssetClicked(source)
      handleExtendDrawer()
    },
    [currentSelectedItem, handleItemSelect]
  )

  return (
    <div>
      {data?.data?.map((source, index) => {
        if (!source) return null

        const itemKey = getItemKey(source)
        const isExpanded = expandedItems.includes(itemKey)
        const canExpand = !source.is_terminal
        const isSelected =
          currentSelectedItem === itemKey ||
          (assetClicked && getItemKey(assetClicked) === itemKey)

        // Get nested data from store
        const NESTED_STORE_KEY = `${source.asset_prefix}:${source.asset_name}`
        const NESTED_DATA = searchAssets[NESTED_STORE_KEY]?.data

        const IS_LOADING = source.asset_name === LOADER_NAME

        if (IS_LOADING) {
          return (
            <div
              className={classes.shellLoader}
              style={{
                marginLeft: `${depth * 20}px`
              }}
            >
              <ShellLoading width={SHELL_WIDTH} height={SHELL_HEIGHT} />
            </div>
          )
        }

        return (
          <div key={`${index}-${itemKey}`}>
            <div
              className={`${classes.treeItem} ${
                isSelected ? classes.treeItemSelected : ''
              }`}
              style={{
                marginLeft: source.is_terminal
                  ? `${depth * 20 + 20}px`
                  : `${depth * 20}px`
              }}
              onClick={() => {
                if (isLakehouse(source)) {
                  handleAssetClick(source)
                }
                if (canExpand) {
                  toggleExpanded(source)
                }
              }}
            >
              {canExpand && !source.is_terminal ? (
                <span
                  className={`${classes.expandIcon} ${
                    isExpanded
                      ? Icons.ICON_KEYBOARD_ARROW_DOWN
                      : Icons.ICON_KEYBOARD_ARROW_RIGHT
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(source)
                  }}
                />
              ) : (
                <span />
              )}
              <span
                onClick={(e) => {
                  if (isLakehouse(source)) {
                    handleAssetClick(source)
                  }
                  if (canExpand) {
                    toggleExpanded(source)
                  }
                }}
                className={classes.treeItemIcon}
              >
                <AssetIcon source={source} />
              </span>

              <div className={classes.treeItemLabel}>
                <TooltipMUI
                  title={
                    source.asset_name.length > getTruncateLength(source.depth)
                      ? source.asset_name
                      : ''
                  }
                >
                  <span className={classes.treeItemLabelText}>
                    {truncate(
                      source.asset_name,
                      getTruncateLength(source.depth)
                    )}
                  </span>
                </TooltipMUI>
              </div>
            </div>
            {isExpanded && NESTED_DATA && (
              <AssetTree
                classes={classes}
                data={NESTED_DATA}
                depth={depth + 1}
                parentPrefix={NESTED_STORE_KEY}
                handleExtendDrawer={handleExtendDrawer}
                setAssetClicked={setAssetClicked}
                assetClicked={assetClicked}
                isReloading={false}
                selectedItemKey={currentSelectedItem}
                onItemSelect={handleItemSelect}
              />
            )}
          </div>
        )
      })}

      {data && currentDataLength < data.total && (
        <div
          className={classes.loadMoreButton}
          style={{
            paddingLeft: `${depth * 20}px`
          }}
        >
          <Button
            variant={ButtonVariants.TERTIARY}
            buttonText={`${data.total - currentDataLength} more`}
            onClick={handleLoadMore}
            leadingIcon={Icons.ICON_KEYBOARD_ARROW_DOWN}
            size={ButtonSizes.SMALL}
          />
        </div>
      )}
    </div>
  )
}

export default compose<any>(withStyles(styles))(AssetTree)
