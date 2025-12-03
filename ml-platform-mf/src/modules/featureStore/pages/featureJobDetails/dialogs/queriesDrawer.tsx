import {Close} from '@mui/icons-material'
import {Drawer} from '@mui/material'
import React from 'react'
import SQLEditor from '../../../../../components/transformation/sqlEditor/sqlEditor'
import {useStyles} from './styles'

interface IProps {
  isOpen: boolean
  onClose: () => void
  query: string
}

const AccountBalanceViewer = (props: IProps) => {
  const {isOpen, onClose, query} = props
  const classes = useStyles()

  return (
    <Drawer
      open={isOpen}
      data-test='queries-drawer'
      onClose={onClose}
      anchor={'right'}
    >
      <div className={classes.drawerHeader}>
        <div>SQL</div>
        <Close
          className={classes.closeIcon}
          onClick={onClose}
          fontSize='small'
        />
      </div>
      <div className={classes.drawerContent}>
        <SQLEditor
          sqlQuery={query}
          readOnly
          className={classes.sqlEditor}
          mode='sql'
        />
      </div>
    </Drawer>
  )
}

export default AccountBalanceViewer
