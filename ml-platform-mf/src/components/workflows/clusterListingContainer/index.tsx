import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback, useEffect, useRef, useState} from 'react'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreateIcon from '@mui/icons-material/Create'
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import {CircularProgress, Menu, MenuItem} from '@mui/material'
import {Icons} from '../../../bit-components/icon/index'
import {Input} from '../../../bit-components/input/index'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../../bit-components/tags/tags-status/index'
import {SelectionOnData as IJobClusterSelectionOnData} from '../../../modules/workflows/graphqlAPIs/getAllJobClusters'
import {SelectionOnData as IAllPurposeClusterSelectionOnData} from '../../../modules/workflows/graphqlAPIs/getAllPurposeClusters'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import {IWorkflowCreateState} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {clusterStatuses} from '../../../modules/workspace/pages/graphqlApis/getClusterStatus/constants'
import {CLUSTER_TYPES} from '../clusterList'
import NoResultsFound from '../noResultsFound'
import {CLUSTER_ACTIONS} from './constant'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  clusters:
    | IWorkflowCreateState['allPurposeClusters']['data']['data']
    | IWorkflowCreateState['jobClusters']['data']['data']
  type: string
  loading: boolean
  onClusterSelected: (
    cluster: (
      | IJobClusterSelectionOnData
      | IAllPurposeClusterSelectionOnData
    ) & {type: string}
  ) => void
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  onScrollToPageEnd?: () => void
}

const ClusterListingContainer = (props: IProps) => {
  const {
    classes,
    searchValue,
    setSearchValue,
    clusters,
    type,
    loading,
    onClusterSelected,
    setSidepanel,
    onScrollToPageEnd
  } = props
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const [selectedJobCluster, setSelectedJobCluster] =
    useState<IJobClusterSelectionOnData>(null)
  const open = Boolean(anchorEl)
  const observer = useRef<any>()

  const lastElementRef = useCallback(
    (node) => {
      if (!onScrollToPageEnd) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        const first = entries[0]
        if (first.isIntersecting) {
          onScrollToPageEnd()
        }
      })

      if (node) observer.current.observe(node)
    },
    [onScrollToPageEnd]
  )

  const handleClose = (ev) => {
    setAnchorEl(null)
  }

  const handleClick: React.MouseEventHandler<SVGSVGElement> = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const menuItems = [
    {
      actionIcon: <RemoveRedEyeIcon className={classes.actionIcon} />,
      actionName: CLUSTER_ACTIONS.VIEW
    },
    {
      actionIcon: <CreateIcon className={classes.actionIcon} />,
      actionName: CLUSTER_ACTIONS.EDIT
    },
    {
      actionIcon: <ContentCopyIcon className={classes.actionIcon} />,
      actionName: CLUSTER_ACTIONS.CLONE
    }
  ]

  const handleMenuItemClicked = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    actionName: string
  ) => {
    e.stopPropagation()

    if (actionName === CLUSTER_ACTIONS.VIEW) {
      setSidepanel({
        open: true,
        type: SIDEPANEL_TYPES.JOB_CLUSTER_DETAILS,
        data: selectedJobCluster?.job_cluster_definition_id
      })
    } else if (actionName === CLUSTER_ACTIONS.EDIT) {
      setSidepanel({
        open: true,
        type: SIDEPANEL_TYPES.JOB_CLUSTER_DETAILS,
        data: selectedJobCluster?.job_cluster_definition_id
      })
    } else if (actionName === CLUSTER_ACTIONS.CLONE) {
      setSidepanel({
        open: true,
        type: SIDEPANEL_TYPES.JOB_CLUSTER_CREATE,
        data: selectedJobCluster?.job_cluster_definition_id
      })
    }

    handleClose(e)
    setSelectedJobCluster(null)
  }

  const getClusterStatus = (status: string) => {
    switch (status) {
      case clusterStatuses.active:
        return TagsStatusTypes.Active
      case clusterStatuses.inactive:
        return TagsStatusTypes.Error
      case clusterStatuses.creating:
        return TagsStatusTypes.Draft
      default:
        return TagsStatusTypes.Draft
    }
  }

  const getClusterLabel = (status: string) => {
    switch (status) {
      case clusterStatuses.active:
        return 'Active'
      case clusterStatuses.inactive:
        return 'Inactive'
      case clusterStatuses.creating:
        return 'Creating'
      default:
        return status
    }
  }

  return (
    <div className={classes.container}>
      <Input
        label='Search...'
        showLabelAsPlaceHolder
        name='Input'
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        icon={Icons.ICON_SEARCH}
        data-testid='workflow-job-cluster-search'
      />
      <div className={classes.list}>
        {clusters?.map(
          (
            cluster:
              | IJobClusterSelectionOnData
              | IAllPurposeClusterSelectionOnData,
            index: number
          ) => (
            <div
              className={classes.listItem}
              onClick={() => {
                onClusterSelected({...cluster, type})
              }}
              data-testid='workflow-job-cluster-list-item'
              ref={index === clusters.length - 1 ? lastElementRef : null}
            >
              <div className={classes.left}>
                <div
                  className={classes.clusterName}
                  data-testid='workflow-job-cluster-list-item-cluster-name'
                >
                  {(cluster as IAllPurposeClusterSelectionOnData).name ||
                    (cluster as IJobClusterSelectionOnData).cluster_name}
                </div>
                <div className={classes.resources}>
                  {cluster.cores} Core/{cluster.memory} GB
                </div>
              </div>
              <div className={classes.right}>
                {type === CLUSTER_TYPES.ALL_PURPOSE && (
                  <TagsStatus
                    status={getClusterStatus(
                      (cluster as IAllPurposeClusterSelectionOnData)?.status
                    )}
                    text={getClusterLabel(
                      (cluster as IAllPurposeClusterSelectionOnData)?.status
                    )}
                  />
                )}
                {type === CLUSTER_TYPES.JOB && (
                  <>
                    <MoreVertOutlinedIcon
                      // className={classes.menuIcon}
                      id='basic-button'
                      aria-controls={open ? 'basic-menu' : undefined}
                      aria-haspopup='true'
                      aria-expanded={open ? 'true' : undefined}
                      onClick={(ev) => {
                        handleClick(ev)
                        setSelectedJobCluster(
                          cluster as IJobClusterSelectionOnData
                        )
                      }}
                    />
                    <Menu
                      id='basic-menu'
                      anchorEl={anchorEl}
                      open={open}
                      onClose={(ev) => {
                        handleClose(ev)
                        setSelectedJobCluster(null)
                      }}
                      MenuListProps={{
                        'aria-labelledby': 'basic-button'
                      }}
                    >
                      {menuItems.length > 0 &&
                        menuItems?.map(({actionIcon, actionName}) => (
                          <MenuItem
                            onClick={(e) =>
                              handleMenuItemClicked(e, actionName)
                            }
                          >
                            {actionIcon}
                            <span className={classes.actionName}>
                              {actionName}
                            </span>
                          </MenuItem>
                        ))}
                    </Menu>
                  </>
                )}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        )}
        {!loading && !clusters?.length && <NoResultsFound />}
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  ClusterListingContainer
)

export default StyleComponent
