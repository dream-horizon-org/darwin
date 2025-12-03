import React from 'react'
import FeatureJobList from './pages/feature-jobs-list/FeatureJobList'

interface IProps {
  history: any
}

const FeatureStore = (props: IProps) => {
  return <FeatureJobList history={props.history} />
}

export default FeatureStore
