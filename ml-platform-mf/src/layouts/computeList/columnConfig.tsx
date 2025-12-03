import React from 'react'
import {Icons} from '../../bit-components/icon/index'
import {Tags, TagsType} from '../../bit-components/tags/tags'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../bit-components/tags/tags-status'
import {Tooltip, ToolTipPlacement} from '../../bit-components/tooltip/index'
import {predefinedToolTips} from '../../components/Info/constants'
import {IColumnConfig} from '../../types/columnConfig.type'
import {getFormattedDateTimeForCompute} from '../../utils/getDateString'

const getColumnConfig = (classes): IColumnConfig[] => {
  return [
    {id: 'clusterName', label: 'CLUSTER NAME'},
    {
      id: 'status',
      label: 'STATUS',
      alignSelf: 'center',
      jsx: (_: any, item) => {
        if (item.status === 'active') {
          return <Tags label={'Active'} type={TagsType?.Valid} />
        } else if (item.status === 'inactive') {
          return <Tags label={'Inactive'} type={TagsType?.Invalid} />
        } else if (item.status === 'creating') {
          return <Tags label={'Creating'} type={TagsType?.Default} />
        }
      }
    },
    {
      id: 'runtime',
      label: (
        <div className={classes.header}>
          <span className={classes.activePodsHeader}>RUNTIME</span>
          <Tooltip
            title={predefinedToolTips.environmentDetails}
            placement={ToolTipPlacement.BottomStart}
          >
            <span className={`${Icons.ICON_INFO} ${classes.infoIcon}`}></span>
          </Tooltip>
        </div>
      ),
      jsx: (_: any, item) => item.runtime,
      minColumnWidth: '200'
    },
    {
      id: 'activePod',
      label: (
        <div className={classes.header}>
          <span className={classes.activePodsHeader}>ACTIVE PODS</span>
          <Tooltip
            title='No of active worker pods'
            placement={ToolTipPlacement.BottomStart}
          >
            <span className={`${Icons.ICON_INFO} ${classes.infoIcon}`}></span>
          </Tooltip>
        </div>
      ),
      alignSelf: 'center',
      jsx: (_: any, item) => {
        return item.activePod ? item.activePod : '--'
      }
    },
    {
      id: 'totalMemory',
      label: (
        <div className={classes.header}>
          <span>TOTAL MEMORY (GB)</span>
          <Tooltip
            title='Total Memory required by all the worker groups'
            placement={ToolTipPlacement.BottomStart}
          >
            <span className={`${Icons.ICON_INFO} ${classes.infoIcon}`}></span>
          </Tooltip>
        </div>
      ),
      alignSelf: 'center',
      jsx: (_: any, item) => {
        return item.totalMemory ? item.totalMemory : '--'
      }
    },
    {
      id: 'createdBy',
      label: 'CREATED BY',
      jsx: (_: any, item) => {
        return item.createBy ? item.createBy : 'SDK'
      }
    },
    {
      id: 'lastUsedOn',
      label: 'LAST USED ON (IST)',
      jsx: (_: any, item) => (
        <>{getFormattedDateTimeForCompute(item.lastUsedOn)}</>
      ),
      minColumnWidth: '200'
    }
  ]
}

export default getColumnConfig
