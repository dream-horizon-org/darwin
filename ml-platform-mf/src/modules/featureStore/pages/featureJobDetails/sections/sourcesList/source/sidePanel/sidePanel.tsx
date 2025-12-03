import {Drawer} from '@mui/material'
import React from 'react'
import {DataList} from '../../../../../../../../components/dataList/dataList'
import {SelectionOnFeatureList} from '../../../../fetchFeatureGroup'

import SQLEditor from '../../../../../../../../components/transformation/sqlEditor/sqlEditor'
import {getColumnConfig} from './columnConfig'
import {useStyles} from './sidePanelJSS'

interface IProps {
  isOpen: boolean
  onClose: () => void
  type: string
  data?: string
  featureList?: SelectionOnFeatureList[]
  drawerTitle: string
}

const codeEditorSourceToModesMapping = {
  s3: 'javascript',
  redshift: 'sql',
  athena: 'sql'
}

const SidePanel = (props: IProps) => {
  const {isOpen, onClose, type, data, featureList, drawerTitle} = props
  const classes = useStyles()

  return (
    <Drawer
      open={isOpen}
      data-test='queries-drawer'
      onClose={onClose}
      anchor={'right'}
    >
      <div className={classes.drawerHeader}>
        <div>{drawerTitle}</div>
      </div>
      <div className={classes.drawerContent}>
        {data ? (
          <SQLEditor
            sqlQuery={data}
            readOnly
            className={classes.sqlEditor}
            mode={codeEditorSourceToModesMapping[type]}
          />
        ) : (
          <div className={classes.featureList}>
            <DataList
              data={featureList}
              stickyHeader={true}
              columnConfig={getColumnConfig()}
              singleSelection={false}
              shouldEnableSelection={false}
              enablePagination={false}
            />
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default SidePanel
