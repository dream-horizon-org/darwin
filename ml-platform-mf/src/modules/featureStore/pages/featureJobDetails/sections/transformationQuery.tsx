import LaunchIcon from '@mui/icons-material/Launch'
import {Card, Typography} from '@mui/material'
import React, {useEffect, useState} from 'react'
import SQLEditor from '../../../../../components/transformation/sqlEditor/sqlEditor'
import QueriesDrawer from '../dialogs/queriesDrawer'
import {useStyles} from './styles'

export enum COMPUTE_TYPE {
  SQL = 'SQL',
  CUSTOMCODE = 'CUSTOMCODE',
  DATABRICKS = 'DATABRICKS'
}

interface IProps {
  computeType: string
  query?: string
  className?: string
  customJobPyFile?: Array<string>
  databricksLink?: string
}

export const TransformationQuery = (props: IProps) => {
  const [showMore, setShowMore] = useState(false)
  const [openQueriesDrawer, setOpenQueriesDrawer] = useState(false)
  useEffect(() => {
    if (!props.query) return
    const loc = (props.query.match(/\n/g) || []).length
    if (loc >= 15) setShowMore(true)
  }, [])

  const toggleQueriesDrawer = () => setOpenQueriesDrawer(!openQueriesDrawer)

  const classes = useStyles({})

  const getTitle = () => {
    switch (props.computeType) {
      case COMPUTE_TYPE.SQL:
        return 'SQL'
      case COMPUTE_TYPE.CUSTOMCODE:
        return 'Custom Code'
      case COMPUTE_TYPE.DATABRICKS:
        return 'Databricks'
    }
  }

  const renderTransformation = () => {
    switch (props.computeType) {
      case COMPUTE_TYPE.SQL:
        return (
          <>
            <SQLEditor
              sqlQuery={props.query}
              readOnly
              className={classes.sqlEditor}
              mode='sql'
            />
            <QueriesDrawer
              query={props.query}
              onClose={toggleQueriesDrawer}
              isOpen={openQueriesDrawer}
            />
          </>
        )
      case COMPUTE_TYPE.CUSTOMCODE:
        return (
          <div className={classes.contentBox}>
            <div className={classes.infoBox}>
              <Typography variant='caption' className={classes.captionText}>
                S3 - Class Name
              </Typography>
              <Typography variant='body2'>{props.className}</Typography>
            </div>
            <div className={classes.infoBox}>
              <Typography variant='caption' className={classes.captionText}>
                S3 Path
              </Typography>
              <Typography variant='body2'>
                {props.customJobPyFile[0]}
              </Typography>
            </div>
          </div>
        )
      case COMPUTE_TYPE.DATABRICKS:
        return (
          <div className={classes.contentBox}>
            <div className={classes.databricksLinkContainer}>
              <a
                href={props.databricksLink}
                target='_blank'
                className={classes.databricksLink}
              >
                {props.databricksLink}
                <LaunchIcon className={classes.launchIcon} />
              </a>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className={classes.section}>
      <div className={classes.headerWrapper}>Source Code</div>
      <div className={classes.editorHeader}>{getTitle()}</div>
      {renderTransformation()}
      {showMore && (
        <div className={classes.viewMore} onClick={toggleQueriesDrawer}>
          View More
        </div>
      )}
    </Card>
  )
}
