import {Checkbox, FormControlLabel, Tooltip} from '@mui/material'
import config from 'config'
import React from 'react'
import {Edge, MarkerType, Node, Position} from 'reactflow'
import {SelectionOnTasks} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {
  WORKFLOW_STANDARDS_FAIL,
  WORKFLOW_STANDARDS_RUNNING,
  WORKFLOW_STANDARDS_SKIPPED,
  WORKFLOW_STANDARDS_SUCCESS,
  WORKFLOW_STANDARDS_UPSTREAM_FAIL
} from '../../../modules/workflows/pages/workflows/constants'
import {generateCoordinates} from './graphGenerator'

const getStatusClass = (status: string, classes) => {
  switch (status) {
    case WORKFLOW_STANDARDS_RUNNING:
      return classes.runningNode
    case WORKFLOW_STANDARDS_SUCCESS:
      return classes.successNode
    case WORKFLOW_STANDARDS_FAIL:
      return classes.errorNode
    case WORKFLOW_STANDARDS_UPSTREAM_FAIL:
      return classes.upstreamFailedNode
    case WORKFLOW_STANDARDS_SKIPPED:
      return classes.skippedNode
    default:
      return ''
  }
}

export const getInitialNodes = (
  classes,
  tasks: SelectionOnTasks[],
  showStatus = false,
  selectedTask: string = '',
  showCheckbox: boolean = false,
  selectedTasks: string[] = [],
  onSelectedTaskChange: (taskName: string) => void = () => {},
  shouldCheckboxBeDisabled: (taskName: string) => boolean = () => false
): Node[] => {
  try {
    const updatedTasks = generateCoordinates(250, 300, tasks)
    return updatedTasks.map((task, tIdx) => {
      const isSelected = selectedTasks.includes(task.task_name)
      return {
        id: task.task_name,
        position: {x: task.x, y: task.y},
        style: {minWidth: 200, background: 'none'},
        data: {
          ...task,
          label: (
            <div
              className={`${classes.nodeContainer} ${
                showStatus && getStatusClass(task.run_status, classes)
              } ${selectedTask === task.task_name ? classes.selectedNode : ''}`}
            >
              <div className={classes.nodeTitleContainer}>
                {showCheckbox && (
                  <Checkbox
                    checked={isSelected}
                    disabled={shouldCheckboxBeDisabled(task.task_name)}
                    onChange={() => onSelectedTaskChange(task.task_name)}
                    size='small'
                    className={classes.checkbox}
                  />
                )}
                <Tooltip title={task.task_name}>
                  <div className={classes.nodeTitleText}>{task.task_name}</div>
                </Tooltip>
              </div>
              <div className={classes.description}>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`}
                />
                <Tooltip title={task.file_path}>
                  <span className={classes.descriptionText}>
                    {task.file_path}
                  </span>
                </Tooltip>
              </div>
              <div className={classes.description}>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
                />
                <Tooltip title={task.attached_cluster?.cluster_name}>
                  <span className={classes.descriptionText}>
                    {task.attached_cluster?.cluster_name}
                  </span>
                </Tooltip>
              </div>
            </div>
          )
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      }
    })
  } catch (e) {
    return []
  }
}

export const getInitialEdges = (tasks: SelectionOnTasks[]): Edge[] => {
  const edges: Edge[] = []
  tasks.forEach((task) => {
    task.depends_on.forEach((prevTask) => {
      edges.push({
        id: `${prevTask}-${task.task_name}`,
        source: prevTask,
        target: task.task_name,
        markerEnd: {
          type: MarkerType.Arrow
        }
      })
    })
  })
  return edges
}

// [
//   {
//     id: '1',
//     position: {x: 0, y: 100},
//     style: {minWidth: 200, background: 'none'},
//     data: {
//       label: (
//         <div className={`${classes.nodeContainer} ${classes.successNode}`}>
//           <div className={classes.nodeTitleContainer}>darshilTask</div>
//           <div className={classes.description}>
//             <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
//             <span className={classes.descriptionText}>notebook path goes</span>
//           </div>
//           <div className={classes.description}>
//             <img
//               src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
//             />
//             <span className={classes.descriptionText}>
//               Cluster name goes here
//             </span>
//           </div>
//         </div>
//       )
//     },
//     sourcePosition: Position.Right,
//     targetPosition: Position.Left
//   },
//   {
//     id: '2',
//     position: {x: 300, y: 0},
//     style: {minWidth: 200, background: 'none'},
//     data: {
//       label: (
//         <div className={`${classes.nodeContainer} ${classes.errorNode}`}>
//           <div className={classes.nodeTitleContainer}>darshilTask</div>
//           <div className={classes.description}>
//             <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
//             <span className={classes.descriptionText}>notebook path goes</span>
//           </div>
//           <div className={classes.description}>
//             <img
//               src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
//             />
//             <span className={classes.descriptionText}>
//               Cluster name goes here
//             </span>
//           </div>
//         </div>
//       )
//     },
//     sourcePosition: Position.Right,
//     targetPosition: Position.Left
//   },
//   {
//     id: '3',
//     position: {x: 300, y: 200},
//     style: {minWidth: 200, background: 'none'},
//     data: {
//       label: (
//         <div className={`${classes.nodeContainer} ${classes.successNode}`}>
//           <div className={classes.nodeTitleContainer}>darshilTask</div>
//           <div className={classes.description}>
//             <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
//             <span className={classes.descriptionText}>notebook path goes</span>
//           </div>
//           <div className={classes.description}>
//             <img
//               src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
//             />
//             <span className={classes.descriptionText}>
//               Cluster name goes here
//             </span>
//           </div>
//         </div>
//       )
//     },
//     sourcePosition: Position.Right,
//     targetPosition: Position.Left
//   },
//   {
//     id: '4',
//     position: {x: 600, y: 0},
//     style: {minWidth: 200, background: 'none'},
//     data: {
//       label: (
//         <div className={`${classes.nodeContainer} ${classes.successNode}`}>
//           <div className={classes.nodeTitleContainer}>darshilTask</div>
//           <div className={classes.description}>
//             <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
//             <span className={classes.descriptionText}>notebook path goes</span>
//           </div>
//           <div className={classes.description}>
//             <img
//               src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
//             />
//             <span className={classes.descriptionText}>
//               Cluster name goes here
//             </span>
//           </div>
//         </div>
//       )
//     },
//     sourcePosition: Position.Right,
//     targetPosition: Position.Left
//   },
//   {
//     id: '5',
//     position: {x: 600, y: 200},
//     style: {minWidth: 200, background: 'none'},
//     data: {
//       label: (
//         <div className={`${classes.nodeContainer} ${classes.successNode}`}>
//           <div className={classes.nodeTitleContainer}>darshilTask</div>
//           <div className={classes.description}>
//             <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
//             <span className={classes.descriptionText}>notebook path goes</span>
//           </div>
//           <div className={classes.description}>
//             <img
//               src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
//             />
//             <span className={classes.descriptionText}>
//               Cluster name goes here
//             </span>
//           </div>
//         </div>
//       )
//     },
//     sourcePosition: Position.Right,
//     targetPosition: Position.Left
//   },
//   {
//     id: '6',
//     position: {x: 900, y: 100},
//     style: {minWidth: 200, background: 'none'},
//     data: {
//       label: (
//         <div className={`${classes.nodeContainer} ${classes.successNode}`}>
//           <div className={classes.nodeTitleContainer}>darshilTask</div>
//           <div className={classes.description}>
//             <img src={`${config.cfMsdAssetUrl}/icons/darwin-notebook.svg`} />
//             <span className={classes.descriptionText}>notebook path goes</span>
//           </div>
//           <div className={classes.description}>
//             <img
//               src={`${config.cfMsdAssetUrl}/icons/darwin-workflow-cluster.svg`}
//             />
//             <span className={classes.descriptionText}>
//               Cluster name goes here
//             </span>
//           </div>
//         </div>
//       )
//     },
//     sourcePosition: Position.Right,
//     targetPosition: Position.Left
//   }
// ]
