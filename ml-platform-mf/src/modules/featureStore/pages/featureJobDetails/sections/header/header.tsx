import {History as HistoryIcon} from '@mui/icons-material'
import {Button} from '@mui/material'
import config from 'config'
import {History} from 'history'
import React from 'react'

import {
  TagsStatus,
  TagsStatusTypes
} from '../../../../../../bit-components/tags/tags-status/index'
import {
  Tags,
  TagsSizes,
  TagsType
} from '../../../../../../bit-components/tags/tags/index'
import {styles} from './headerJSS'

interface IProps {
  featureGroupName: string
  featureGroupStatus: string
  version: number
  toggleVersionHistoryDialog: () => void
  history: History
}

const Header = (props: IProps) => {
  const {
    featureGroupName,
    featureGroupStatus,
    version,
    toggleVersionHistoryDialog,
    history
  } = props
  const classes = styles({})

  return (
    <>
      <div className={classes.title}>
        <div>{featureGroupName}</div>
        <div className={classes.versionTag}>
          <Tags
            label={`V${version}`}
            size={TagsSizes.Medium}
            type={TagsType.Default}
          />
        </div>
        <div className={classes.versionStatus}>
          {featureGroupStatus === 'ACTIVE' ? (
            <>
              <div className={classes.activeCircle}></div>
              <div className={classes.activeCircleLable}>Active</div>
            </>
          ) : (
            <>
              <div className={classes.inactiveCircle}></div>
              <div className={classes.inactiveCircleLable}>Inactive</div>
            </>
          )}
        </div>
      </div>
      <div className={classes.actionButtonsWrapper}>
        <div
          className={classes.historyIconWrapper}
          onClick={toggleVersionHistoryDialog}
        >
          <HistoryIcon />
        </div>
      </div>
    </>
  )
}

export default Header
