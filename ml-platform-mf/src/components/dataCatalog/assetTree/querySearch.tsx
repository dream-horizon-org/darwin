import {Tooltip as TooltipMUI} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import {FixedSizeList} from 'react-window'
import {compose} from 'redux'
import {Icons} from '../../../bit-components/icon/index'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {Typography} from '../../../bit-components/typography/index'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {useCatalogStore} from '../../../modules/catalog/store/catalogStore'
import {API_STATUS} from '../../../utils/apiUtils'
import {truncate} from '../../../utils/helper'
import {highlightSearchMatch} from '../../../utils/searchUtils'
import AssetIcon from '../assetIcon'
import {DEFAULT_PREFIX, QUERY_SEARCH_CONSTANTS} from '../constant'
import {
  buildHierarchicalTree,
  getPathsToExpand,
  getTruncateLength,
  TreeNode
} from '../utils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  handleExtendDrawer?: () => void
  setAssetClicked?: (assetClicked: SelectionOnData) => void
  assetClicked?: SelectionOnData
}

interface FlatTreeItem {
  node: TreeNode
  depth: number
  isVisible: boolean
  hasChildren: boolean
  isExpanded: boolean
  parentPath?: string
}

const QuerySearch = (props: IProps) => {
  const {classes, handleExtendDrawer, setAssetClicked, assetClicked} = props
  const {
    querySearchAssets,
    querySearchAssetsData,
    expandedItems,
    addExpandedItem,
    removeExpandedItem,
    setExpandedItems,
    resetQuerySearchAssets,
    searchQuery
  } = useCatalogStore()
  const {
    PAGE_SIZE,
    SHELL_LOADING_WIDTH,
    SHELL_LOADING_HEIGHT,
    LIST_ITEM_HEIGHT
  } = QUERY_SEARCH_CONSTANTS
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [catalogPageNumber, setCatalogPageNumber] = useState(0)
  const [lastPageNumber, setLastPageNumber] = useState(0)
  const [lastElement, setLastElement] = useState(null)

  // Helper function to get item key from source
  const getItemKey = (source: TreeNode | SelectionOnData) =>
    `${source.asset_prefix}:${source.asset_name}`

  // Function to flatten the hierarchical tree into a flat list
  const flattenTree = useCallback(
    (nodes: TreeNode[]): FlatTreeItem[] => {
      const flatItems: FlatTreeItem[] = []

      const traverse = (
        node: TreeNode,
        depth: number = 0,
        parentPath?: string
      ) => {
        const isExpanded = expandedItems.includes(node.fullPath)
        const hasChildren = node.children.length > 0
        const isVisible =
          depth === 0 || (parentPath && expandedItems.includes(parentPath))

        // Add current node to flat list
        flatItems.push({
          node,
          depth,
          isVisible,
          hasChildren,
          isExpanded,
          parentPath
        })

        // If node is expanded, add its children
        if (isExpanded && hasChildren) {
          node.children.forEach((child) =>
            traverse(child, depth + 1, node.fullPath)
          )
        }
      }

      nodes.forEach((node) => traverse(node))
      return flatItems.filter((item) => item.isVisible)
    },
    [expandedItems]
  )

  const querySearchFunc = (pageNumber: number) => {
    const variables = {
      asset_name_regex: searchQuery,
      asset_prefix_regex: DEFAULT_PREFIX,
      page_size: PAGE_SIZE,
      offset: pageNumber * PAGE_SIZE,
      depth: null
    }
    if (searchQuery && (pageNumber === 0 || pageNumber <= lastPageNumber)) {
      const previousData = pageNumber > 0 ? querySearchAssetsData?.data : null
      querySearchAssets(variables, previousData)
    }
  }

  useEffect(() => {
    if (assetClicked?.asset_prefix && assetClicked?.asset_name) {
      const itemKey = getItemKey(assetClicked)
      setSelectedItem(itemKey)
    }
  }, [assetClicked])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting && catalogPageNumber < lastPageNumber) {
        setCatalogPageNumber((no) => no + 1)
      }
    })
    // Disconnect existing observer
    if (observer) {
      observer.disconnect()
    }

    // Observe the element if it exists
    if (lastElement && observer) {
      observer.observe(lastElement)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [lastElement])

  useEffect(() => {
    // Reset state first
    setCatalogPageNumber(0)
    resetQuerySearchAssets()

    // Then make the API call
    querySearchFunc(0)
  }, [searchQuery])

  useEffect(() => {
    if (catalogPageNumber > 0) {
      querySearchFunc(catalogPageNumber)
    }
  }, [catalogPageNumber])

  // Effect to intelligently expand nodes based on search results
  useEffect(() => {
    if (querySearchAssetsData?.data?.data && searchQuery) {
      const searchData = querySearchAssetsData.data.data.filter(
        Boolean
      ) as SelectionOnData[]
      const treeData = buildHierarchicalTree(searchData)

      const pathsToExpand = getPathsToExpand(treeData, searchData, searchQuery)

      // Use the shared expanded state from catalog store
      setExpandedItems(pathsToExpand)
      setLastPageNumber(
        Math.ceil(querySearchAssetsData?.data?.total / PAGE_SIZE) - 1
      )
    }
  }, [querySearchAssetsData, searchQuery])

  const toggleNodeExpansion = (nodeId: string) => {
    if (expandedItems.includes(nodeId)) {
      removeExpandedItem(nodeId)
    } else {
      addExpandedItem(nodeId)
    }
  }
  // Build hierarchical tree and then flatten it
  const treeData = buildHierarchicalTree(
    (querySearchAssetsData?.data?.data?.filter(Boolean) as SelectionOnData[]) ||
      []
  )
  const flatItems = useMemo(() => flattenTree(treeData), [treeData])

  // Virtualized list item component
  const ListItem = React.memo(({index, style, data}: any) => {
    const item = data[index]
    const {node, depth, hasChildren, isExpanded} = item
    const isExpandable = !node.is_terminal
    const nodeKey = getItemKey(node)
    const isSelected =
      selectedItem === nodeKey ||
      (assetClicked && getItemKey(assetClicked) === nodeKey)

    const handleAssetClick = () => {
      setSelectedItem(nodeKey)
      if (node?.is_terminal) {
        setAssetClicked(node)
        handleExtendDrawer()
      }
    }

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isExpandable) {
        toggleNodeExpansion(node.fullPath)
      }
    }

    return (
      <div
        key={`${node.fullPath}-${index}`}
        className={depth > 0 ? classes.querySearchTree : ''}
        style={{
          paddingLeft: `${depth * 20}px`,
          ...style
        }}
      >
        <div
          className={`${classes.treeItem} ${
            isSelected ? classes.treeItemSelected : ''
          }`}
          onClick={(e) => {
            handleAssetClick()
            if (!node.is_terminal) {
              handleExpandClick(e)
            }
          }}
        >
          <span
            className={`${classes.expandIcon} ${
              isExpandable
                ? isExpanded
                  ? Icons.ICON_KEYBOARD_ARROW_DOWN
                  : Icons.ICON_KEYBOARD_ARROW_RIGHT
                : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleExpandClick(e)
            }}
          />

          <span
            className={classes.treeItemIcon}
            onClick={(e) => {
              handleAssetClick()
              handleExpandClick(e)
            }}
          >
            <AssetIcon source={node} />
          </span>

          <TooltipMUI
            title={
              node.asset_name.length > getTruncateLength(node.depth)
                ? node.asset_name
                : ''
            }
          >
            <div className={classes.treeItemLabel}>
              <span className={classes.treeItemLabelText}>
                {highlightSearchMatch(
                  truncate(node.asset_name, getTruncateLength(node.depth)),
                  searchQuery,
                  classes
                )}
              </span>
            </div>
          </TooltipMUI>
        </div>
      </div>
    )
  })

  if (querySearchAssetsData?.data?.data?.length === 0) {
    return (
      <div>
        <Typography>No data available</Typography>
      </div>
    )
  }

  return (
    <div className={classes.querySearchTreeContainer}>
      <AutoSizer>
        {({height, width}) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={flatItems.length}
            itemSize={LIST_ITEM_HEIGHT}
            itemData={flatItems}
          >
            {ListItem}
          </FixedSizeList>
        )}
      </AutoSizer>

      {querySearchAssetsData?.data?.data?.length > 0 &&
        catalogPageNumber < lastPageNumber && <div ref={setLastElement}></div>}
      <div>
        {querySearchAssetsData?.status === API_STATUS.LOADING && (
          <div className={classes.loadingContainer}>
            <ShellLoading
              width={SHELL_LOADING_WIDTH}
              height={SHELL_LOADING_HEIGHT}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  QuerySearch
)

export default StyleComponent
