import {Card} from '@mui/material'
import React from 'react'

import config from 'config'
import {
  SelectionOnAthena,
  SelectionOnDataFeast,
  SelectionOnRedShift,
  SelectionOnS3,
  SelectionOnSinks,
  SelectionOnSources
} from '../../fetchFeatureGroup'
import Source from './source/source'
import {styles} from './sourcesListJSS'

interface IProps {
  sectionTitle: string
  sources: SelectionOnSources | SelectionOnSinks
}

const SourcesList = (props: IProps) => {
  const classes = styles({})
  const {sources, sectionTitle} = props

  const getS3SourcesJSX = (sourcesData: Array<SelectionOnS3>) =>
    sourcesData.map((sourceData) => (
      <Source
        sourceType='s3'
        sourceIcon={`${config.cfMsdAssetUrl}/images/aws-icons/s3.png`}
        sourceLabel='S3'
        sourceLocationLabel='Location'
        sourceLocationValue={sourceData.location}
        sourceReferenceNameLabel='Reference Name'
        sourceReferenceNameValue={sourceData.referenceName}
        sourceData={sourceData.metadata}
        actionLabel='View Metadata'
      />
    ))

  const getRedshiftSourcesJSX = (sourcesData: Array<SelectionOnRedShift>) =>
    sourcesData.map((sourceData) => (
      <Source
        sourceType='redshift'
        sourceIcon={`${config.cfMsdAssetUrl}/images/aws-icons/Redshift.png`}
        sourceLabel='Redshift'
        sourceLocationLabel='Location'
        sourceLocationValue={sourceData.location}
        sourceReferenceNameLabel='Reference Name'
        sourceReferenceNameValue={sourceData.referenceName}
        sourceData={sourceData.query}
        actionLabel='View Query'
      />
    ))

  const getDataFeastSourcesJSX = (sourcesData: Array<SelectionOnDataFeast>) =>
    sourcesData.map((sourceData) => (
      <Source
        sourceType='dataFeast'
        sourceIcon={`${config.cfMsdAssetUrl}/images/aws-icons/Redshift.png`}
        sourceLabel='Data Feast'
        sourceLocationLabel='Feature Group'
        sourceLocationValue={sourceData.featureGroup}
        sourceReferenceNameLabel='Reference Name'
        sourceReferenceNameValue={sourceData.referenceName}
        featureList={sourceData.featureList}
        actionLabel='View Feature List'
      />
    ))

  const getAthenaSourcesJSX = (sourcesData: Array<SelectionOnAthena>) =>
    sourcesData.map((sourceData) => (
      <Source
        sourceType='athena'
        sourceIcon={`${config.cfMsdAssetUrl}/images/aws-icons/Athena.png`}
        sourceLabel='Athena'
        sourceLocationLabel='Table Name'
        sourceLocationValue={sourceData.tableName}
        sourceReferenceNameLabel='Dataset Reference Name'
        sourceReferenceNameValue={sourceData.datasetReferenceName}
        sourceData={sourceData.query}
        actionLabel='View Query'
      />
    ))

  return (
    <Card className={classes.container}>
      <div className={classes.header}>{sectionTitle}</div>
      <div className={classes.sources}>
        {getS3SourcesJSX(sources.s3)}
        {getRedshiftSourcesJSX(sources.redShift)}
        {getDataFeastSourcesJSX(sources.dataFeast)}
        {getAthenaSourcesJSX(sources.athena)}
      </div>
    </Card>
  )
}

export default SourcesList
