import QueryBuilderIcon from '@mui/icons-material/QueryBuilder'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useState} from 'react'
import {
  Popout,
  PopoutHorizontalPositions,
  PopoutVerticalPositions
} from '../../../bit-components/popout/index'
import {TagsStatus} from '../../../bit-components/tags/tags-status/index'
import {SelectionOnData} from '../../../modules/workflows/graphqlAPIs/getWorkflows/index'

import {ClickAwayListener, Tooltip} from '@mui/material'
import cronstrue from 'cronstrue'
import {Link} from 'react-router-dom'
import {
  RECENTLY_CREATED_CRON_EXPRESSION_TRUNCATE_LENGTH,
  RECENTLY_CREATED_TITLE_TRUNCATE_LENGTH
} from '../../../modules/workflows/pages/workflows/constants'
import {
  formattedSnakeString,
  getTagStatus
} from '../../../modules/workflows/pages/workflows/utils'
import {truncate} from '../../../utils/helper'
import {
  getNumberOfTagsToBeShown,
  getTagsToShow
} from '../allWorkflows/columnConfig'
import {NUMBER_OF_TAGS_TO_SHOW} from '../allWorkflows/constant'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: SelectionOnData
}

const RecentlyCreatedWorkflow = (props: IProps) => {
  const {classes, workflowDetails} = props
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClose = (e: any) => {
    e.stopPropagation()
    setAnchorEl(null)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const getPopoutOptions = () => {
    return workflowDetails?.tags.slice(NUMBER_OF_TAGS_TO_SHOW).map((tag) => ({
      label: tag
    }))
  }

  const cronExpression = workflowDetails?.schedule
    ? workflowDetails.schedule === '@once'
      ? '@once'
      : cronstrue.toString(workflowDetails?.schedule, {
          throwExceptionOnParseError: false,
          verbose: true
        })
    : 'N/A'

  return (
    <>
      <Link
        className={classes.container}
        to={`/workflows/${workflowDetails?.workflow_id}/runs`}
      >
        <div className={classes.content}>
          <div>
            <div className={classes.heading}>
              <Tooltip
                title={
                  workflowDetails?.display_name.length >
                  RECENTLY_CREATED_TITLE_TRUNCATE_LENGTH
                    ? workflowDetails?.display_name
                    : ''
                }
              >
                <div>
                  <span>
                    {truncate(
                      workflowDetails?.display_name,
                      RECENTLY_CREATED_TITLE_TRUNCATE_LENGTH
                    )}
                  </span>
                </div>
              </Tooltip>
            </div>
            <div className={classes.tags}>
              {getTagsToShow(workflowDetails?.tags)}
              <span onClick={handleClick}>
                {getNumberOfTagsToBeShown(workflowDetails?.tags, classes)}
              </span>
            </div>
          </div>
          <div>
            <TagsStatus
              status={getTagStatus(workflowDetails?.status)}
              text={formattedSnakeString(workflowDetails?.status)}
            />
          </div>
        </div>
        <div className={classes.bottom}>
          <QueryBuilderIcon className={classes.icon} />
          <span className={classes.scheduleText}>Schedule:</span>
          <Tooltip
            title={
              cronExpression.length >
              RECENTLY_CREATED_CRON_EXPRESSION_TRUNCATE_LENGTH
                ? cronExpression
                : ''
            }
          >
            <span className={classes.scheduleDescription}>
              {truncate(
                cronExpression,
                RECENTLY_CREATED_CRON_EXPRESSION_TRUNCATE_LENGTH
              )}
            </span>
          </Tooltip>
        </div>
      </Link>

      <ClickAwayListener
        disableReactTree={true}
        onClickAway={(ev) => {
          if (anchorEl) handleClose(ev)
        }}
      >
        <span>
          <Popout
            anchorEl={anchorEl}
            optionsList={getPopoutOptions()}
            handleClose={handleClose}
            anchorOrigin={{
              vertical: PopoutVerticalPositions.BOTTOM,
              horizontal: PopoutHorizontalPositions.LEFT
            }}
            transformOrigin={{
              vertical: PopoutVerticalPositions.TOP,
              horizontal: PopoutHorizontalPositions.LEFT
            }}
          />
        </span>
      </ClickAwayListener>
    </>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(
  RecentlyCreatedWorkflow
)

export default StyleComponent
