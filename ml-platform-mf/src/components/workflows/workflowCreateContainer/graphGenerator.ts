import dagre from 'dagre'
import {SelectionOnTasks} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {IWorkflowTaskForm} from '../../../modules/workflows/types/common.types'
import {getIdForTaskName} from './nodes'

export interface TaskGraph extends IWorkflowTaskForm {
  x: number
  y: number
  height: number
  width: number
}

export const generateCoordinates = (
  width: number,
  height: number,
  data: IWorkflowTaskForm[]
): TaskGraph[] => {
  const flow = new dagre.graphlib.Graph()
  flow.setGraph({
    rankdir: 'LR'
  })
  flow.setDefaultEdgeLabel(() => ({}))
  // Set nodes
  data.forEach((node, index) => {
    flow.setNode(node.id, {
      width,
      height,
      ...node
    })
  })

  // Set edges
  data.forEach(({id, dependentOn}) => {
    dependentOn
      .filter((d) => d && d.trim())
      .forEach((taskId) => {
        flow.setEdge(taskId, id)
      })
  })

  dagre.layout(flow)
  const newFlow = flow.nodes().map((i) => flow.node(i))
  return newFlow as TaskGraph[]
}
