import {ListItemIcon, ListItemText} from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {Button, ButtonVariants} from '../../bit-components/button/index'
import {Icons} from '../../bit-components/icon/index'

import {routes} from '../../constants'
import clusterActions, {
  IClusterActions
} from '../../hoc/clusterActions/clusterActions'
import styles from './ClusterDetailsManageJSS'

interface IProps extends WithStyles<typeof styles>, IClusterActions {
  clusterId: string
  clusterStatus: string
}

const ClusterDetailsManage = (props: IProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const history = useHistory()
  const {
    clusterId,
    clusterStatus,
    setClusterStatus,
    onStopClusterClicked,
    stopClusterResponse,
    onStartClusterClicked,
    startClusterResponse,
    onDeleteClusterClicked,
    deleteClusterResponse,
    onRestartClusterClicked,
    restartClusterResponse
  } = props

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (stopClusterResponse?.stopCluster?.status === 'SUCCESS') {
      setClusterStatus('inactive')
    }
  }, [stopClusterResponse])

  useEffect(() => {
    if (startClusterResponse?.startCluster?.status === 'SUCCESS') {
      setClusterStatus('creating')
    }
  }, [startClusterResponse])

  useEffect(() => {
    if (restartClusterResponse?.reStartCluster?.status === 'SUCCESS') {
      setClusterStatus('creating')
    }
  }, [restartClusterResponse])

  useEffect(() => {
    if (deleteClusterResponse?.deleteCluster?.status === 'SUCCESS') {
      history.push(`${routes.compute}`)
    }
  }, [deleteClusterResponse])

  const onMenuItemClicked = (optionSelected: string) => {
    if (optionSelected === 'edit') {
      history.push(`${routes.compute}/${clusterId}/configuration/`)
    } else if (optionSelected === 'stop') {
      onStopClusterClicked(clusterId)
    } else if (optionSelected === 'delete') {
      onDeleteClusterClicked(clusterId)
    } else if (optionSelected === 'start') {
      onStartClusterClicked(clusterId)
    } else if (optionSelected === 'restart') {
      onRestartClusterClicked(clusterId)
    }

    handleClose()
  }

  const cloneClickHandler = (clusterId) => {
    history.push(`${routes.clusterCreatePage}?clone=${clusterId}`)
  }

  return (
    <div>
      <Button
        buttonText={'action'}
        onClick={handleClick}
        trailingIcon={Icons.ICON_ARROW_DROP_DOWN}
        variant={ButtonVariants.SECONDARY}
      />
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem onClick={() => cloneClickHandler(clusterId)}>
          <ListItemIcon>
            <span className={Icons.ICON_COPY} />
          </ListItemIcon>
          <ListItemText>Clone</ListItemText>
        </MenuItem>
        {clusterStatus === 'inactive' && (
          <MenuItem onClick={() => onMenuItemClicked('start')}>
            <ListItemIcon>
              <span className={Icons.ICON_PLAY_CIRCLE_OUTLINE} />
            </ListItemIcon>
            <ListItemText>Start</ListItemText>
          </MenuItem>
        )}
        {(clusterStatus === 'active' || clusterStatus === 'creating') && (
          <MenuItem onClick={() => onMenuItemClicked('restart')}>
            <ListItemIcon>
              <span className={Icons.ICON_REFRESH} />
            </ListItemIcon>
            <ListItemText>Restart</ListItemText>
          </MenuItem>
        )}
        {(clusterStatus === 'active' || clusterStatus === 'creating') && (
          <MenuItem onClick={() => onMenuItemClicked('stop')}>
            <ListItemIcon>
              <span className={Icons.ICON_STOP} />
            </ListItemIcon>
            <ListItemText>Stop</ListItemText>
          </MenuItem>
        )}
        {clusterStatus === 'inactive' && (
          <MenuItem onClick={() => onMenuItemClicked('delete')}>
            <ListItemIcon>
              <span className={Icons.ICON_DELETE} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(
  ClusterDetailsManage
)

export default clusterActions(styleComponent)
