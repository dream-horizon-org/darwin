import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import React from 'react'
import {SelectionOnData as IComputeClusterDetails} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeCluster'
import {IComputeState} from '../../../modules/compute/pages/graphqlApis/reducer'
import DashboardLink from '../dashboardLink'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  dashboards: IComputeClusterDetails['dashboards']
  isSparkDashboardActive: boolean
  computeCurrentStatus: string
  sparkHistoryServer: IComputeState['sparkHistoryServer']
  onStartSparkHistoryServer: () => void
  sparkHistoryDashboardStatus: string
  isJobCluster: boolean
}

const Dashboards = (props: IProps) => {
  const {
    classes,
    dashboards,
    isSparkDashboardActive,
    computeCurrentStatus,
    sparkHistoryServer,
    onStartSparkHistoryServer,
    sparkHistoryDashboardStatus,
    isJobCluster
  } = props

  const getActivatedTillTime = () => {
    const startedAt = new Date(sparkHistoryServer?.data?.started_at)
    const ttl = sparkHistoryServer?.data?.ttl
    const activatedTill = new Date(startedAt.getTime() + ttl * 60000)

    let hours = activatedTill.getHours()
    const minutes = activatedTill.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12
    hours = hours ? hours : 12

    const strMinutes = minutes < 10 ? '0' + minutes : minutes
    const strTime = hours + ':' + strMinutes + ' ' + ampm + ' IST'

    return strTime
  }

  const getSubText = () => {
    switch (sparkHistoryDashboardStatus) {
      case 'active':
        return `Active till ${getActivatedTillTime()}`
      case 'inactive':
        return 'Click to Launch'
      case 'creating':
        return 'Please Wait...'
      case 'created':
        return `Please Wait...`
      case 'failed':
        return 'Click to Re-Launch'
      default:
        return 'Click to Launch'
    }
  }

  return (
    <div className={classes.container}>
      <DashboardLink
        logoLink={`${config.cfMsdAssetUrl}/icons/darwin_ray_logo.png`}
        altText={'Ray Logo'}
        dashboardName={'Ray Dashboard'}
        link={dashboards?.rayDashboardUrl}
        isActive={computeCurrentStatus !== 'inactive'}
        disabledLogoLink={`${config.cfMsdAssetUrl}/icons/darwin_disabled_ray_logo.png`}
      />

      <DashboardLink
        logoLink={`${config.cfMsdAssetUrl}/icons/darwin_spark_logo.png`}
        altText={'Spark Live Dashboard'}
        dashboardName={'Spark Live Dashboard'}
        link={dashboards?.sparkUIUrl}
        isActive={isSparkDashboardActive}
        disabledLogoLink={`${config.cfMsdAssetUrl}/icons/darwin_disabled_spark_logo.png`}
      />
      <DashboardLink
        logoLink={`${config.cfMsdAssetUrl}/icons/darwin_grafana_logo.png`}
        altText={'Grafana Dashboard'}
        dashboardName={'Grafana Dashboard'}
        link={dashboards?.grafanaDashboardUrl}
        isActive={computeCurrentStatus !== 'inactive'}
        disabledLogoLink={`${config.cfMsdAssetUrl}/icons/darwin_disabled_grafana_logo.png`}
      />
      <DashboardLink
        logoLink={`${config.cfMsdAssetUrl}/icons/darwin_spark_logo.png`}
        altText={'Spark History Dashboard'}
        dashboardName={'Spark History Dashboard'}
        link={sparkHistoryServer?.data?.url}
        isActive={
          sparkHistoryDashboardStatus === 'active' ||
          sparkHistoryDashboardStatus === 'creating'
        }
        disabledLogoLink={`${config.cfMsdAssetUrl}/icons/darwin_disabled_spark_logo.png`}
        enableClick={true}
        onClick={onStartSparkHistoryServer}
        dashboardStatus={
          sparkHistoryDashboardStatus !== 'inactive'
            ? sparkHistoryDashboardStatus
            : ''
        }
        subText={getSubText()}
      />
      <DashboardLink
        logoLink={`${config.cfMsdAssetUrl}/icons/darwin_datadog_logo.png`}
        altText={'Datadog Dashboard'}
        dashboardName={'Resource Utilization Dashboard'}
        link={dashboards?.resourceUtilizationDashboardUrl}
      />
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(Dashboards)

export default styleComponent
