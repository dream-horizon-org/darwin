import React from 'react'
import {SelectionOnFeatureGroup} from '../fetchFeatureGroup'
import {TransformationQuery} from './transformationQuery'

interface IProps {
  featureGroupInfo: SelectionOnFeatureGroup
}

export const Transformation = (props: IProps) => {
  const {featureGroupInfo} = props

  return (
    <TransformationQuery
      computeType={featureGroupInfo?.computeMetadata?.computeType}
      query={featureGroupInfo?.computeMetadata?.sqlQuery}
      className={featureGroupInfo?.computeMetadata?.customCode?.s3ClassName}
      customJobPyFile={[
        featureGroupInfo?.computeMetadata?.customCode?.requirementFilePath
      ]}
      databricksLink={featureGroupInfo?.computeMetadata?.databricksLink}
    />
  )
}
