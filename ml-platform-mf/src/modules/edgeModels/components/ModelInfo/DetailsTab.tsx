import React from 'react'
import CreateModelBody from '../../components/CreateModelBody'
import {Flow} from '../../data/types'
import {transformedDataType} from '../../data/types'

const DetailsTab = (props: {flow: Flow; detailsData: transformedDataType}) => {
  const {flow, detailsData} = props

  return <CreateModelBody flow={flow} deploymentDetails={detailsData} />
}

export default DetailsTab
