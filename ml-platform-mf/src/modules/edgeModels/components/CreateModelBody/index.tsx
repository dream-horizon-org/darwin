import React from 'react'
import {Flow} from '../../data/types'
import {transformedDataType} from '../../data/types'
import ModelSelection from './ModelSelection'

const CreateModalBody = (props: {
  flow: Flow
  deploymentDetails: transformedDataType
}) => {
  const {flow, deploymentDetails} = props
  return <ModelSelection flow={flow} deploymentDetails={deploymentDetails} />
}

export default CreateModalBody
