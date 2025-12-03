import {withStyles, WithStyles} from '@mui/styles'
import dagre from 'dagre'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  BaseEdge,
  Connection,
  Controls,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  Handle,
  Node,
  NodeProps,
  Position,
  useEdgesState,
  useNodesState
} from 'reactflow'
import {Typography} from '../../../bit-components/typography/index'
import {SelectionOnGetLineageAsset} from '../../../modules/catalog/graphqlApis/getLineageAsset/index'
import lineageGraphStyles from './LineageGraphJSS'

// Import CSS only on client side
if (typeof window !== 'undefined') {
  require('reactflow/dist/style.css')
}

// Quality indicator types
interface QualityIndicators {
  freshness: boolean
  completeness: boolean
  correctness: boolean
}

// Function to generate random quality indicators with 80% weight for true (green tick) and 20% for false (red cross)
const generateRandomQualityIndicators = (): QualityIndicators => {
  const generateRandomBoolean = () => Math.random() < 0.8

  return {
    freshness: generateRandomBoolean(),
    completeness: generateRandomBoolean(),
    correctness: generateRandomBoolean()
  }
}

interface IProps extends WithStyles<typeof lineageGraphStyles> {
  lineageData: SelectionOnGetLineageAsset
}

// Quality Indicators Component
const QualityIndicators = ({
  indicators,
  classes
}: {
  indicators: QualityIndicators
  classes: any
}) => {
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null)

  const QualityIcon = ({
    type,
    label,
    isGood
  }: {
    type: string
    label: string
    isGood: boolean
  }) => (
    <div
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
      onMouseEnter={() => setHoveredIndicator(label)}
      onMouseLeave={() => setHoveredIndicator(null)}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          backgroundColor: isGood ? '#4caf50' : '#f44336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {isGood ? '✓' : '✕'}
      </div>
      {hoveredIndicator === label && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {`${label.charAt(0).toUpperCase() + label.slice(1)}: ${
            isGood ? 'Good' : 'Poor'
          }`}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid rgba(0, 0, 0, 0.8)'
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
      <QualityIcon type='F' label='freshness' isGood={indicators.freshness} />
      <QualityIcon
        type='C'
        label='completeness'
        isGood={indicators.completeness}
      />
      <QualityIcon
        type='CR'
        label='correctness'
        isGood={indicators.correctness}
      />
    </div>
  )
}

// Custom Node Component
const CustomAssetNode = withStyles(lineageGraphStyles)(
  ({data, id, classes}: NodeProps & WithStyles<typeof lineageGraphStyles>) => {
    const maxFieldsToShow = 15 // Limit visible fields to prevent very tall nodes
    const fieldsToShow = data.fields?.slice(0, maxFieldsToShow) || []
    const hasMoreFields = data.fields && data.fields.length > maxFieldsToShow

    return (
      <div
        style={{
          background: data.isSelected ? '#e3f2fd' : '#fff',
          border: `2px solid ${data.isSelected ? '#1976d2' : '#ddd'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          minWidth: '300px',
          maxWidth: '320px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Handle type='target' position={Position.Left} />

        {/* Header */}
        <div style={{marginBottom: data.fields?.length ? '8px' : '0'}}>
          {/* Table Name with Quality Indicators horizontally positioned */}
          <div
            style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}
          >
            <Typography className={classes.nodeTitle}>{data.label}</Typography>
            {data.qualityIndicators && (
              <div style={{marginLeft: '8px'}}>
                <QualityIndicators
                  indicators={data.qualityIndicators}
                  classes={classes}
                />
              </div>
            )}
          </div>
          {data.metadata && (
            <Typography className={classes.nodeMetadata}>
              {data.metadata}
            </Typography>
          )}
        </div>

        {/* Fields */}
        {fieldsToShow.length > 0 && (
          <div
            style={{
              borderTop: '2px solid #e0e0e0',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#f8f9fa',
              margin: '0 -16px',
              padding: '4px 0',
              borderRadius: '0 0 6px 6px'
            }}
          >
            {fieldsToShow.map((field, index) => (
              <div key={index} className={classes.fieldItem}>
                <Typography className={classes.fieldName}>
                  {field.name}
                </Typography>
                <Typography className={classes.fieldType}>
                  {field.type}
                </Typography>
              </div>
            ))}
            {hasMoreFields && (
              <Typography className={classes.moreFields}>
                +{data.fields!.length - maxFieldsToShow} more fields...
              </Typography>
            )}
          </div>
        )}

        <Handle type='source' position={Position.Right} />
      </div>
    )
  }
)

// Custom Edge Component for Field Mappings
const CustomFieldEdge = withStyles(lineageGraphStyles)(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    classes
  }: EdgeProps & WithStyles<typeof lineageGraphStyles>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    })

    const [showTooltip, setShowTooltip] = useState(false)

    const fieldMappings = data?.fieldMappings || []
    const displayMappings = fieldMappings.slice(0, 2) // Show max 2 on edge
    const hasMore = fieldMappings.length > 2

    return (
      <>
        <BaseEdge path={edgePath} style={style} />
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: 'all'
            }}
            className={classes?.edgeLabel}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div
              style={{
                background: 'rgba(25, 118, 210, 0.95)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                minWidth: 'max-content'
              }}
            >
              {displayMappings.map((mapping, index) => (
                <div key={index} style={{whiteSpace: 'nowrap'}}>
                  {mapping}
                </div>
              ))}
              {hasMore && (
                <div style={{fontStyle: 'italic', fontSize: '9px'}}>
                  +{fieldMappings.length - 2} more...
                </div>
              )}
            </div>

            {showTooltip && fieldMappings.length > 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.9)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  marginTop: '4px',
                  zIndex: 1000,
                  maxWidth: '200px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{fontWeight: 600, marginBottom: '4px'}}>
                  All Field Mappings:
                </div>
                {fieldMappings.map((mapping, index) => (
                  <div
                    key={index}
                    style={{whiteSpace: 'nowrap', marginBottom: '2px'}}
                  >
                    {mapping}
                  </div>
                ))}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      </>
    )
  }
)

const nodeTypes = {
  customAsset: CustomAssetNode
}

const edgeTypes = {
  fieldMapping: CustomFieldEdge
}

// Auto-layout function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({rankdir: 'LR', ranksep: 300, nodesep: 150})

  nodes.forEach((node) => {
    // Calculate height based on number of fields
    const fieldCount = node.data.fields?.length || 0
    const baseHeight = 80
    const fieldHeight = fieldCount * 20 // 20px per field
    const maxHeight = 400 // Maximum height to prevent very tall nodes
    const height = Math.min(baseHeight + fieldHeight, maxHeight)

    dagreGraph.setNode(node.id, {width: 320, height: height})
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 160, // Adjust for wider nodes (320/2)
        y: nodeWithPosition.y - nodeWithPosition.height / 2
      }
    }
  })

  return {nodes: layoutedNodes, edges}
}

const LineageGraph = (props: IProps) => {
  const {classes, lineageData} = props

  const {initialNodes, initialEdges} = useMemo(() => {
    if (!lineageData?.graph || !lineageData?.assetsInfo) {
      return {initialNodes: [], initialEdges: []}
    }

    // Extract unique nodes from edges and assetsInfo
    const nodeSet = new Set<string>()
    const edgesData = lineageData.graph.filter((edge) => edge?.from && edge?.to)

    // Add all nodes from edges
    edgesData.forEach((edge) => {
      if (edge?.from) nodeSet.add(edge.from)
      if (edge?.to) nodeSet.add(edge.to)
    })

    // Add nodes from assetsInfo keys
    if (typeof lineageData.assetsInfo === 'object' && lineageData.assetsInfo) {
      Object.keys(lineageData.assetsInfo).forEach((key) => {
        nodeSet.add(key)
      })
    }

    // Create React Flow nodes
    const nodes: Node[] = Array.from(nodeSet).map((nodeId, index) => {
      let metadata = ''
      let fields: Array<{name: string; type: string}> = []

      // Try to get metadata and fields from assetsInfo
      if (
        typeof lineageData.assetsInfo === 'object' &&
        lineageData.assetsInfo &&
        nodeId in lineageData.assetsInfo
      ) {
        const assetInfo = (lineageData.assetsInfo as any)[nodeId]
        if (typeof assetInfo === 'object' && assetInfo) {
          metadata = assetInfo.type || assetInfo.source || 'Asset'

          // Extract fields from asset_schema.schema_json.fields
          if (
            assetInfo.asset_schema &&
            assetInfo.asset_schema.schema_json &&
            assetInfo.asset_schema.schema_json.fields &&
            Array.isArray(assetInfo.asset_schema.schema_json.fields)
          ) {
            fields = assetInfo.asset_schema.schema_json.fields.map(
              (field: any) => ({
                name: field.name || '',
                type: field.type || ''
              })
            )
          }
        }
      }

      return {
        id: nodeId,
        type: 'customAsset',
        position: {x: index * 300, y: 100},
        data: {
          label: nodeId.split(':').pop() || nodeId, // Show just the table name
          fullName: nodeId,
          metadata: metadata,
          fields: fields,
          isSelected: false,
          qualityIndicators: generateRandomQualityIndicators()
        }
      }
    })

    // Create React Flow edges
    const edges: Edge[] = edgesData.map((edge, index) => {
      // Create field mappings array
      const fieldMappings: string[] = []
      if (edge?.fields_map && typeof edge.fields_map === 'object') {
        Object.entries(edge.fields_map).forEach(
          ([sourceField, targetFields]) => {
            if (Array.isArray(targetFields)) {
              targetFields.forEach((targetField) => {
                fieldMappings.push(`${sourceField} → ${targetField}`)
              })
            }
          }
        )
      }

      return {
        id: `edge-${index}`,
        source: edge!.from!,
        target: edge!.to!,
        type: 'fieldMapping',
        animated: true,
        style: {
          stroke: '#1976d2',
          strokeWidth: 3
        },
        data: {
          fieldMappings: fieldMappings
        }
      }
    })

    // Auto-layout the graph
    const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
      nodes,
      edges
    )

    return {
      initialNodes: layoutedNodes,
      initialEdges: layoutedEdges
    }
  }, [lineageData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isSelected: n.id === node.id
          }
        }))
      )
    },
    [setNodes]
  )

  if (!lineageData?.graph || lineageData.graph.length === 0) {
    return (
      <div className={classes.emptyContainer}>
        <Typography className={classes.emptyText}>
          No lineage graph data available
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.graphContainer}>
      <div className={classes.graphWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  )
}

export default withStyles(lineageGraphStyles)(LineageGraph)
