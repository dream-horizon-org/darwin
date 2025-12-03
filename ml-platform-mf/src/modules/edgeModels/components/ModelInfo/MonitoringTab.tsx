import config from 'config'
import React from 'react'
import DashboardLink from '../../../../components/compute/dashboardLink'
import {grafanaBaseUrl} from '../../data/constants'

const MonitoringTab = (props: {appVersions: any; modelId: any}) => {
  const {appVersions, modelId} = props
  const url = new URL(grafanaBaseUrl)

  url.searchParams.set('var-app_version', appVersions[0])
  url.searchParams.set('var-model_id', modelId)

  return (
    <DashboardLink
      logoLink={`${config.cfMsdAssetUrl}/icons/darwin_grafana_logo.png`}
      altText={'Grafana Dashboard'}
      dashboardName={'Grafana Dashboard'}
      link={url.toString()}
      isActive={true}
    />
  )
}

export default MonitoringTab
