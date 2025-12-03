import {ListItemIcon, ListItemText} from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {WithStyles, withStyles} from '@mui/styles'
import config from 'config'
import React from 'react'
import {useHistory} from 'react-router-dom'
import {Icons} from '../../bit-components/icon/index'

import {routes} from '../../constants'
import styles from './clusterManageJSS'

interface IProps extends WithStyles<typeof styles> {
  clusterId: string
  clusterStatus: string
  onStopClusterClicked: (clusterId: string) => void
  onDeleteClusterClicked: (clusterId: string) => void
  onStartClusterClicked: (clusterId: string) => void
  onReStartClusterClicked: (clusterId: string) => void
}

const ClusterManage = (props: IProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const history = useHistory()
  const {
    classes,
    clusterId,
    clusterStatus,
    onStopClusterClicked,
    onDeleteClusterClicked,
    onStartClusterClicked,
    onReStartClusterClicked
  } = props

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const onMenuItemClicked = (
    optionSelected: string,
    data?: {clusterId: string}
  ) => {
    if (optionSelected === 'edit') {
      history.push(`${routes.compute}/${clusterId}/configuration/`)
    } else if (optionSelected === 'stop') {
      onStopClusterClicked(data.clusterId)
    } else if (optionSelected === 'delete') {
      onDeleteClusterClicked(data.clusterId)
    } else if (optionSelected === 'start') {
      onStartClusterClicked(data.clusterId)
    } else if (optionSelected === 'restart') {
      onReStartClusterClicked(data.clusterId)
    }
    handleClose()
  }

  const cloneClickHandler = (clusterId) => {
    handleClose()
    history.push(`${routes.clusterCreatePage}?clone=${clusterId}`)
  }

  return (
    <div>
      <span
        onClick={handleClick}
        className={`${Icons.ICON_MORE_VERT} ${classes.clickable}`}
      ></span>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem onClick={() => onMenuItemClicked('edit')}>
          <ListItemIcon>
            <span className={Icons.ICON_EDIT} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => cloneClickHandler(clusterId)}>
          <ListItemIcon>
            <span className={Icons.ICON_COPY} />
          </ListItemIcon>
          <ListItemText>Clone</ListItemText>
        </MenuItem>
        {clusterStatus === 'inactive' && (
          <MenuItem onClick={() => onMenuItemClicked('start', {clusterId})}>
            <ListItemIcon>
              <span className={Icons.ICON_PLAY_CIRCLE_OUTLINE} />
            </ListItemIcon>
            <ListItemText>Start</ListItemText>
          </MenuItem>
        )}
        {(clusterStatus === 'active' || clusterStatus === 'creating') && (
          <MenuItem onClick={() => onMenuItemClicked('restart', {clusterId})}>
            <ListItemIcon>
              <span className={Icons.ICON_REFRESH} />
            </ListItemIcon>
            <ListItemText>Restart</ListItemText>
          </MenuItem>
        )}
        {(clusterStatus === 'active' || clusterStatus === 'creating') && (
          <MenuItem onClick={() => onMenuItemClicked('stop', {clusterId})}>
            <ListItemIcon>
              <span className={Icons.ICON_STOP} />
            </ListItemIcon>
            <ListItemText>Stop</ListItemText>
          </MenuItem>
        )}
        {clusterStatus === 'inactive' && (
          <MenuItem onClick={() => onMenuItemClicked('delete', {clusterId})}>
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

const styleComponent = withStyles(styles, {withTheme: true})(ClusterManage)

export default styleComponent
