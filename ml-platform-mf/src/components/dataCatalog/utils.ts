import {SelectionOnData} from '../../modules/catalog/graphqlApis/searchAssets/index'
import {
  ICEBERG,
  QUERY_SEARCH_CONSTANTS,
  REDSHIFT,
  TOTAL_ASSET_LENGTH
} from './constant'

export const copyFunction = (
  db: string,
  table: string,
  type: string,
  assetPrefix: string
) => {
  const SPARK_GLUE_ICEBERG_COPY_CODE_COMMAND = `spark.sql("select * from iceberg_catalog.${db}.${table} limit 1")`

  const SPARK_GLUE_TABLE_COPY_CODE_COMMAND = `spark.sql("select * from ${db}.${table} limit 1")`

  const SPARK_REDSHIFT_COPY_CODE_COMMAND = `df = spark.read.format("io.github.spark_redshift_community.spark.redshift") \\
    .option("url", "jdbc:redshift://dream11-segment-2.cd2mebwblp0z.us-east-1.redshift.amazonaws.com:5439/segment?user=ADD_USERNAME&password=ADD_PASSWORD") \\
    .option("forward_spark_s3_credentials", "true") \\
    .option("tempdir", "s3a://d11-data-lake/darwin/catalog/redshift/") \\
    .option("query", "SELECT * FROM ${db}.${table} LIMIT 10") \\
    .load()`

  if (type === ICEBERG) {
    return SPARK_GLUE_ICEBERG_COPY_CODE_COMMAND
  } else if (assetPrefix.includes(REDSHIFT)) {
    return SPARK_REDSHIFT_COPY_CODE_COMMAND
  }

  return SPARK_GLUE_TABLE_COPY_CODE_COMMAND
}
export interface TreeNode {
  asset_name: string
  asset_prefix: string
  depth: number
  is_terminal: boolean
  children: TreeNode[]
  fullPath: string
}

export const buildHierarchicalTree = (data: SelectionOnData[]): TreeNode[] => {
  const tree: TreeNode[] = []
  const nodeMap = new Map<string, TreeNode>()

  // Filter out stream data, only show table data
  const tableData = data.filter(
    (item) =>
      item.asset_prefix &&
      item.asset_prefix.includes('table') &&
      !item.asset_prefix.includes('stream')
  )

  // Process all items to build the complete hierarchy
  tableData.forEach((item) => {
    if (!item.asset_name || !item.asset_prefix) return

    // Split the prefix into parts to create hierarchy
    const prefixParts = item.asset_prefix.split(':')

    // Skip first two levels (dream11, table) - start from index 2
    const relevantParts = prefixParts.slice(
      QUERY_SEARCH_CONSTANTS.RELEVANT_PARTS_START_INDEX
    )

    // Build the full path for this item
    const fullItemPath =
      relevantParts.length > 0
        ? `${relevantParts.join(':')}: ${item.asset_name}`
        : item.asset_name

    let currentPath = ''
    let parentNode: TreeNode | null = null

    // Create intermediate nodes for each part of the path
    relevantParts.forEach((part, index) => {
      const previousPath = currentPath
      currentPath = currentPath ? `${currentPath}:${part} ` : part

      let existingNode = nodeMap.get(currentPath)

      if (!existingNode) {
        existingNode = {
          asset_name: part,
          asset_prefix: previousPath,
          depth: index + 2,
          is_terminal: false,
          children: [],
          fullPath: currentPath
        }

        nodeMap.set(currentPath, existingNode)

        if (parentNode) {
          parentNode.children.push(existingNode)
        } else {
          tree.push(existingNode)
        }
      }

      parentNode = existingNode
    })

    // Create the final item node
    const itemNode: TreeNode = {
      asset_name: item.asset_name,
      asset_prefix: item.asset_prefix,
      depth: item.depth || 0,
      is_terminal: item.is_terminal || false,
      children: [],
      fullPath: fullItemPath
    }

    // Add to appropriate parent or root
    if (parentNode) {
      parentNode.children.push(itemNode)
    } else {
      // This is a root-level item (direct match)
      tree.push(itemNode)
    }

    // Also add to nodeMap for potential parent lookups
    nodeMap.set(fullItemPath, itemNode)
  })

  return tree
}

export const hasNestedSearchMatch = (
  nodePath: string,
  searchData: SelectionOnData[],
  query: string
): boolean => {
  return searchData.some((item) => {
    if (!item.asset_name || !item.asset_prefix) return false

    // Check if this item is a nested child of the nodePath
    const itemFullPath = `${item.asset_prefix}:${item.asset_name} `
    const isNestedChild =
      itemFullPath.includes(nodePath) && itemFullPath !== nodePath

    // Check if the nested child contains the search term
    const containsSearchTerm = item.asset_name
      .toLowerCase()
      .includes(query.toLowerCase())

    return isNestedChild && containsSearchTerm
  })
}

export const getPathsToExpand = (
  nodes: TreeNode[],
  searchData: SelectionOnData[],
  query: string
): string[] => {
  const pathsToExpand: string[] = []

  const traverse = (node: TreeNode) => {
    if (!node.is_terminal && node.children.length > 0) {
      // Only expand if this node has nested children that match the search
      if (hasNestedSearchMatch(node.fullPath, searchData, query)) {
        pathsToExpand.push(node.fullPath)
      }
    }
    node.children.forEach(traverse)
  }

  nodes.forEach(traverse)
  return pathsToExpand
}

export const getTruncateLength = (depth: number) => {
  return TOTAL_ASSET_LENGTH - (depth - 2) * 5
}

export const getAssetSchema = (schema_json: any) => {
  // Handle case where schema_json is null, undefined, or doesn't have fields
  if (
    !schema_json ||
    !schema_json.fields ||
    !Array.isArray(schema_json.fields)
  ) {
    return []
  }

  // Extract name and type from each field
  return schema_json.fields.map((field: any) => ({
    name: field.name || '',
    type: field.type || ''
  }))
}

export const getTypeFromMetadata = (
  metadata: string | null | undefined
): string => {
  if (!metadata) return '-'
  const parsedMetadata = JSON.parse(metadata)
  return parsedMetadata.type || '-'
}
