import {Edge, MarkerType, Node, Position} from 'reactflow'

export const initialEdges: Edge<any>[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    markerEnd: {
      type: MarkerType.Arrow
    }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    markerEnd: {
      type: MarkerType.Arrow
    }
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    markerEnd: {
      type: MarkerType.Arrow
    }
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    markerEnd: {
      type: MarkerType.Arrow
    }
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
    markerEnd: {
      type: MarkerType.Arrow
    }
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    markerEnd: {
      type: MarkerType.Arrow
    }
  }
]
