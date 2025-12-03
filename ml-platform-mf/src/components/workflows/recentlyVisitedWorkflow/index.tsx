import Tooltip from '@mui/material/Tooltip'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {Link} from 'react-router-dom'
import {TagsStatus} from '../../../bit-components/tags/tags-status/index'
import {SelectionOnData as recentlyVisitedWorkflow} from '../../../modules/workflows/graphqlAPIs/getRecentlyVisitedWorkflows/index'
import {RECENTLY_VISITED_TITLE_TRUNCATE_LENGTH} from '../../../modules/workflows/pages/workflows/constants'
import {
  formattedSnakeString,
  getTagStatus
} from '../../../modules/workflows/pages/workflows/utils'
import {getTimeDiff} from '../../../modules/workspace/utils'
import {truncate} from '../../../utils/helper'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  data: recentlyVisitedWorkflow
}

const RecentlyVisitedWorkflow = (props: IProps) => {
  const {classes, data} = props

  return (
    <Link
      to={`/workflows/${data?.workflow_id}/runs`}
      className={classes.container}
    >
      <div className={classes.left}>
        <Tooltip
          title={
            data.display_name?.length > RECENTLY_VISITED_TITLE_TRUNCATE_LENGTH
              ? data.display_name
              : ''
          }
          data-testid={`recently-visited-workflow-tooltip-${data.workflow_name}`}
        >
          <div>
            <span>
              {truncate(
                data.display_name,
                RECENTLY_VISITED_TITLE_TRUNCATE_LENGTH
              )}
            </span>
          </div>
        </Tooltip>
      </div>
      <div className={classes.right}>
        <div>
          <TagsStatus
            status={getTagStatus(data?.status)}
            text={formattedSnakeString(data.status)}
          />
        </div>
        <div className={classes.time}>{getTimeDiff(data.last_run_time)}</div>
      </div>
    </Link>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  RecentlyVisitedWorkflow
)

export default StyleComponent
