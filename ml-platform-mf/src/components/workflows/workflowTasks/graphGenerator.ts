import dagre from 'dagre'
import {SelectionOnTasks} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'

export interface TaskGraph extends SelectionOnTasks {
  x: number
  y: number
  height: number
  width: number
}

export const generateCoordinates = (
  width: number,
  height: number,
  data: SelectionOnTasks[]
): TaskGraph[] => {
  const flow = new dagre.graphlib.Graph()
  flow.setGraph({
    rankdir: 'LR'
  })
  flow.setDefaultEdgeLabel(() => ({}))
  // Set nodes
  data.forEach((node, index) => {
    flow.setNode(node.task_name, {
      width,
      height,
      ...node
    })
  })

  // Set edges
  data.forEach(({task_name, depends_on}) => {
    depends_on
      .filter((d) => d && d.trim())
      .forEach((previousId) => {
        flow.setEdge(previousId, task_name)
      })
  })

  dagre.layout(flow)
  const newFlow = flow.nodes().map((i) => flow.node(i))
  return newFlow as TaskGraph[]
}
