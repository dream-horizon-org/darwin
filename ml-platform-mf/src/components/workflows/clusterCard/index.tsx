import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {IconButton, Menu, MenuItem} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {Control, useFormContext, useWatch} from 'react-hook-form'
import {useDispatch, useSelector} from 'react-redux'
import {compose} from 'redux'
import {setGlobalSnackBar} from '../../../actions/commonActions'
import {Dialog} from '../../../bit-components/dialog/index'
import {Tooltip, ToolTipPlacement} from '../../../bit-components/tooltip/index'
import {
  DeleteCluster,
  DeleteClusterInput
} from '../../../modules/compute/pages/sharedGraphql/deleteClusterGraphql/deleteCluster'
import {DeleteClusterSchema} from '../../../modules/compute/pages/sharedGraphql/deleteClusterGraphql/deleteCluster.gqlTypes'
import {
  DeleteJobClusterDefinition,
  DeleteJobClusterDefinitionInput
} from '../../../modules/compute/pages/sharedGraphql/deleteJobClusterDefinition/deleteJobClusterDefinition'
import {DeleteJobClusterDefinitionSchema} from '../../../modules/compute/pages/sharedGraphql/deleteJobClusterDefinition/deleteJobClusterDefinition.gqlTypes'
import {GQL as deleteJobClusterDefinitionGql} from '../../../modules/compute/pages/sharedGraphql/deleteJobClusterDefinition/deleteJobClusterDefinitionGql'
import {
  GetWorkflowsAttachedToCluster,
  GetWorkflowsAttachedToClusterInput
} from '../../../modules/workflows/graphqlAPIs/getWorkflowsAttachedToClusters'
import {GetWorkflowsAttachedToClusterSchema} from '../../../modules/workflows/graphqlAPIs/getWorkflowsAttachedToClusters/index.gqlTypes'
import {GQL as getWorkflowsAttachedToClusterGql} from '../../../modules/workflows/graphqlAPIs/getWorkflowsAttachedToClusters/indexGql'
import {
  removeWorkflowJobCLuster,
  resetWorkflowAttachedClusters,
  resetWorkflowHighlightedCluster,
  setClusterOperation,
  setWorkflowHighlightedCluster
} from '../../../modules/workflows/pages/workflowCreate/actions'
import {
  IWorkflowCreateForm,
  IWorkflowTaskForm
} from '../../../modules/workflows/types/common.types'
import {CommonState, SnackbarType} from '../../../reducers/commonReducer'
import {useGQL} from '../../../utils/useGqlRequest'
import ClusterStatusTag from '../../clusterStatusTag'
import styles from './indexJSS'
export interface ClusterCardProps {
  id: string
  name: string
  core: number
  memory: number
  runtime: string
  estimatedCost: string
  createdAt: string
  status: string | null
  type: 'job' | 'all_purpose'
}
interface IProps extends WithStyles<typeof styles> {
  id: string
  name: string
  core: number
  memory: number
  runtime: string
  estimatedCost: number
  createdAt: string
  status?: string
  type: 'job' | 'all_purpose'
  taskIndex: number
  variant?: 'primary' | 'secondary'
  group: 'other' | 'current' | 'none'
}
const ClusterCard = (props: IProps) => {
  const {
    classes,
    id,
    name,
    core,
    memory,
    runtime,
    estimatedCost,
    createdAt,
    status,
    type,
    taskIndex,
    variant = 'primary',
    group
  } = props

  const state = useSelector(
    (state: CommonState) => state.workflowCreateReducer.clusters
  )

  const {setValue, getValues} = useFormContext<IWorkflowCreateForm>()

  const highlighted = useMemo(() => {
    return state.highlightedCluster === id && variant === 'primary'
  }, [state.highlightedCluster])

  const statusIndicatorColor = useMemo(() => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#11A93C'
      case 'inactive':
        return '#FF7070'
      default:
        return '#57ABFF'
    }
  }, [status])

  const dispatch = useDispatch()
  const toggleHighlight = () => {
    highlighted
      ? dispatch(resetWorkflowHighlightedCluster())
      : dispatch(setWorkflowHighlightedCluster(id))
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const attached = useMemo(() => {
    return state.attachedClusters[taskIndex]?.id === id
  }, [state.attachedClusters, taskIndex])

  const timeAgo = useMemo(() => {
    if (!createdAt) return null
    let createdAtIst = createdAt
    if (!createdAt.includes('Z') && !createdAt.includes('+')) {
      createdAtIst = createdAt + 'Z'
    }

    const now = new Date()
    const then = new Date(createdAtIst)

    const diffMs = now.getTime() - then.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays === 0) {
      if (diffHours >= 1) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffMinutes >= 1) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
      } else {
        return 'just now'
      }
    } else if (diffDays === 1) {
      return 'yesterday'
    } else {
      return `${diffDays} days ago`
    }
  }, [createdAt])

  const options = useMemo(() => {
    if (type === 'job') {
      return [
        {
          icon: <ContentCopyIcon />,
          label: 'Clone',
          onClick: () => {
            dispatch(setClusterOperation('job', 'clone', id, type))
            handleClose()
          }
        },
        {
          icon: <DeleteOutlineIcon />,
          label: 'Delete',
          onClick: () => {
            // TODO: Open the deletion modal
            setDeleteOpen(true)
            handleClose()
          }
        }
      ]
    } else if (type === 'all_purpose') {
      return [
        {
          icon: <ContentCopyIcon />,
          label: 'Clone to All Purpose',
          onClick: () => {
            dispatch(setClusterOperation('all_purpose', 'clone', id, type))
            handleClose()
          }
        },
        {
          icon: <ContentCopyIcon />,
          label: 'Clone to Job Cluster',
          onClick: () => {
            dispatch(setClusterOperation('job', 'clone', id, type))
            handleClose()
          }
        }
      ]
    } else {
      return []
    }
  }, [type])

  const {
    output: {
      response: getAttachedWorkflowsResponse,
      loading: getAttachedWorkflowsLoading,
      errors: getAttachedWorkflowsErrors
    },
    triggerGQLCall: triggerGetAttachedWorkflows
  } = useGQL<
    GetWorkflowsAttachedToClusterInput,
    GetWorkflowsAttachedToCluster
  >()

  useEffect(() => {
    if (deleteOpen) {
      triggerGetAttachedWorkflows(
        {
          ...getWorkflowsAttachedToClusterGql,
          variables: {
            clusterId: id
          }
        },
        GetWorkflowsAttachedToClusterSchema
      )
    }
  }, [deleteOpen])

  const attachedClusters: number | null = useMemo(() => {
    if (getAttachedWorkflowsResponse) {
      return getAttachedWorkflowsResponse?.getWorkflowsAttachedToCluster.length
    }
    return null
  }, [getAttachedWorkflowsResponse])

  const {
    output: {
      response: deleteClusterResponse,
      loading: deleteClusterLoading,
      errors: deleteClusterErrors
    },
    triggerGQLCall: triggerDeleteCluster
  } = useGQL<DeleteJobClusterDefinitionInput, DeleteJobClusterDefinition>()

  useEffect(() => {
    if (deleteClusterResponse?.deleteJobClusterDefinition?.data?.is_deleted) {
      if (group === 'current' || group === 'other') {
        dispatch(
          setGlobalSnackBar({
            open: true,
            type: SnackbarType.SUCCESS,
            message: 'Successfully deleted cluster!'
          })
        )
        dispatch(removeWorkflowJobCLuster(group, id))
      }
      // get all tasks where this workflow is attached ?
      const deletedClusterId =
        deleteClusterResponse?.deleteJobClusterDefinition?.data?.job_cluster_id
      const tasks: IWorkflowTaskForm[] = getValues('tasks')
      const updatedTasks = tasks.map((task, index) => {
        if (task.cluster?.id === deletedClusterId) {
          return {
            ...task,
            cluster: null
          }
        }
        return task
      })
      setValue('tasks', updatedTasks)
      dispatch(resetWorkflowAttachedClusters())
      dispatch(resetWorkflowHighlightedCluster())
      setDeleteOpen(false)
    } else if (deleteClusterErrors) {
      // TODO: Handle Failed delete
      dispatch(
        setGlobalSnackBar({
          open: true,
          type: SnackbarType.ERROR,
          message: 'Failed to delete cluster!'
        })
      )
    }
  }, [deleteClusterResponse, deleteClusterLoading, deleteClusterErrors])

  const triggerDelete = () => {
    if (getAttachedWorkflowsResponse?.getWorkflowsAttachedToCluster) {
      triggerDeleteCluster(
        {
          ...deleteJobClusterDefinitionGql,
          variables: {
            input: {
              cluster_id: id
            }
          }
        },
        DeleteJobClusterDefinitionSchema
      )
    }
  }

  const getDialogContent = () => {
    if (getAttachedWorkflowsLoading) {
      return (
        <p className={classes.dialogContentWrapper}>
          Checking if cluster is in use...
        </p>
      )
    }
    if (attachedClusters) {
      return (
        <p className={classes.dialogContentWrapper}>
          This job cluster is being used in {attachedClusters} workflows. Are
          you sure you want to delete it?
        </p>
      )
    } else {
      return (
        <p className={classes.dialogContentWrapper}>
          This job cluster is not being used in any workflows. Are you sure you
          want to delete it?
        </p>
      )
    }
  }

  return (
    <div
      className={`${classes.container} ${highlighted && classes.selected} ${
        variant === 'secondary' && classes.secondaryContainer
      }`}
      onClick={!open && toggleHighlight}
    >
      <div className={classes.clusterDetailsContainer}>
        <Tooltip title={name} placement={ToolTipPlacement.Bottom}>
          <h1 className={classes.name}>{name}</h1>
        </Tooltip>
        {attached && <div className={classes.attachedIndicator}>Attached</div>}
        <div className={classes.actionsContainer}>
          {status && <ClusterStatusTag status={status} />}
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              dispatch(setClusterOperation(type, 'edit', id, type))
            }}
            disableRipple
            className={classes.actionButton}
          >
            <EditIcon className={classes.actionIcon} />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              handleOpen(e)
            }}
            disableRipple
            className={classes.actionButton}
          >
            <MoreVertIcon className={classes.actionIcon} />
          </IconButton>
        </div>
      </div>

      <div
        className={classes.clusterDetailsContainer}
        style={{marginTop: '4px'}}
      >
        <p>
          {core} Core / {memory} GB
        </p>
        <div className={classes.divider} />
        <p>{runtime}</p>
      </div>
      <div
        className={classes.clusterDetailsContainer}
        style={{marginTop: estimatedCost && timeAgo && '12px'}}
        hidden={!estimatedCost && !timeAgo}
      >
        <p hidden={!estimatedCost}>Estimated cost: ${estimatedCost}/hour</p>
        <div className={classes.divider} hidden={!estimatedCost} />
        <p hidden={!timeAgo}>Created {timeAgo}</p>
      </div>

      <Menu
        id='long-menu'
        MenuListProps={{
          'aria-labelledby': 'long-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem
            key={option.label}
            onClick={option.onClick}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              columnGap: '8px'
            }}
          >
            {option.icon}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
      <Dialog
        handleClose={() => setDeleteOpen(false)}
        open={deleteOpen}
        title={`Delete ${name}?`}
        dialogContent={getDialogContent()}
        dialogFooter={{
          primaryButton: {
            text: 'YES, DELETE',
            onClick: () => {
              triggerDelete()
            },
            isLoading: deleteClusterLoading || getAttachedWorkflowsLoading,
            disabled: deleteClusterLoading || getAttachedWorkflowsLoading
          },
          secondaryButton: {
            text: 'CANCEL',
            disabled: deleteClusterLoading,
            onClick: () => {
              setDeleteOpen(false)
            },
            isLoading: deleteClusterLoading
          }
        }}
      />
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  ClusterCard
)

export default StyleComponent
