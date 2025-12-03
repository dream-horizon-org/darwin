import {Typography} from '@mui/material'
import React, {useState} from 'react'
import {
  Button,
  ButtonVariants
} from '../../../../../../../bit-components/button/index'
import {SelectionOnFeatureList} from '../../../fetchFeatureGroup'
import SidePanel from './sidePanel/sidePanel'

import {styles} from './sourceJSS'

interface IProps {
  sourceType: string
  sourceIcon: string
  sourceLabel: string
  sourceLocationLabel: string
  sourceLocationValue: string
  sourceReferenceNameLabel: string
  sourceReferenceNameValue: string
  sourceData?: string
  featureList?: SelectionOnFeatureList[]
  actionLabel: string
}

const drawerTitles = {
  s3: 'S3',
  redshift: 'Redshift',
  dataFeast: 'Feature List',
  athena: 'Athena'
}

const Source = (props: IProps) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const classes = styles({})
  const {
    sourceType,
    sourceIcon,
    sourceLabel,
    sourceLocationLabel,
    sourceLocationValue,
    sourceReferenceNameLabel,
    sourceReferenceNameValue,
    sourceData,
    featureList,
    actionLabel
  } = props

  const toggleSidePanel = () => setIsSidePanelOpen(!isSidePanelOpen)

  return (
    <div className={classes.source}>
      <div className={classes.sourceType}>
        <img src={sourceIcon} alt='Source' />
        <Typography variant='body2' className={classes.sourceLabel}>
          {sourceLabel}
        </Typography>
      </div>
      <div className={classes.sourceLocation}>
        <Typography variant='caption' className={classes.sourceLocationLabel}>
          {sourceLocationLabel}
        </Typography>
        <Typography variant='body2'>{sourceLocationValue}</Typography>
      </div>
      {sourceReferenceNameValue && (
        <div className={classes.sourceReferenceName}>
          <Typography
            variant='caption'
            className={classes.sourceReferenceNameLabel}
          >
            {sourceReferenceNameLabel}
          </Typography>
          <Typography variant='body2'>{sourceReferenceNameValue}</Typography>
        </div>
      )}
      {sourceData && (
        <div className={classes.sourceAction}>
          <Button
            buttonText={actionLabel}
            variant={ButtonVariants.TERTIARY}
            onClick={toggleSidePanel}
          />
        </div>
      )}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={toggleSidePanel}
        type={sourceType}
        data={sourceData}
        featureList={featureList}
        drawerTitle={drawerTitles[sourceType]}
      />
    </div>
  )
}

export default Source
