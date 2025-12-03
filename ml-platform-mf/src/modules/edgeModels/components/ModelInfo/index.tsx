import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import {Tab} from '@mui/material'
import React, {useEffect, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import GlobalSpinner from '../../../../components/globalSpinner'
import useQuery, {QueryParams} from '../../../../components/useQuery/index.js'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped.js'
import {transformedDataType} from '../../data/types'
import {Flow} from '../../data/types.js'
import {transformDeploymentsData, transformDetailsData} from '../../data/utils'
import type {
  GetModelDeploymentForId,
  GetModelDeploymentForIdInput
} from '../../graphQL/queries/getModelDeploymentForId/index.js'
import {GQL as detailsGQL} from '../../graphQL/queries/getModelDeploymentForId/indexGql.js'
import CreateModelHeader from '../CreateModelHeader/index'
import DeploymentsTab from './DeploymentsTab'
import DetailsTab from './DetailsTab'
import MonitoringTab from './MonitoringTab'

enum TAB_OPTIONS {
  DETAILS = 'details',
  DEPLOYMENTS = 'deployments',
  MONITORING = 'monitoring'
}

const ModelInfoComponent = ({classes}) => {
  const {deploymentId} = useParams<{deploymentId: string}>()
  const query = useQuery()
  const history = useHistory()

  const [tabValue, setTabValue] = useState<string>(
    query.get(QueryParams.TYPE) || 'details'
  )
  const [detailsData, setDetailsData] = useState<transformedDataType>(null)
  const [deploymentsData, setDeploymentsData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getModelDeploymentsForId()
  }, [deploymentId])

  const getModelDeploymentsForId = async () => {
    try {
      const response = await gqlRequestTyped<
        GetModelDeploymentForIdInput,
        GetModelDeploymentForId
      >({
        ...detailsGQL,
        variables: {
          deploymentId: deploymentId
        }
      })

      const {getModelDeploymentForId} = response.data
      const transformedDetails = transformDetailsData(getModelDeploymentForId)
      const transformedDeployments = transformDeploymentsData(
        getModelDeploymentForId
      )

      setDetailsData(transformedDetails)
      setDeploymentsData(transformedDeployments)
      setLoading(false)
    } catch (error) {}
  }

  const refresh = () => {
    getModelDeploymentsForId()
  }

  const handleTabChange = (
    event: React.SyntheticEvent,
    newTabValue: string
  ) => {
    setTabValue(newTabValue)
    history.replace({
      pathname: `/edge-models/info/${deploymentId}`,
      search: `?${QueryParams.TYPE}=${newTabValue}`
    })
  }

  return (
    <div className={classes.infoContainer}>
      <GlobalSpinner show={loading} />
      {!loading && (
        <>
          <CreateModelHeader
            flow={Flow.Detail}
            deploymentDetails={detailsData}
          />

          <div>
            <TabContext value={tabValue}>
              <TabList
                onChange={handleTabChange}
                textColor='inherit'
                indicatorColor='primary'
                sx={{
                  width: 1088,
                  marginLeft: 33,
                  borderBottom: 1,
                  borderColor: '#333333',
                  '& .MuiTabs-flexContainer': {
                    background: 'inherit'
                  },
                  '& .Mui-selected': {
                    color: '#57ABFF'
                  }
                }}
              >
                <Tab label='Details' value={TAB_OPTIONS.DETAILS} />
                <Tab label='Deployments' value={TAB_OPTIONS.DEPLOYMENTS} />
                <Tab label='Monitoring' value={TAB_OPTIONS.MONITORING} />
              </TabList>

              <TabPanel value={TAB_OPTIONS.DETAILS}>
                <div className={classes.detailsTab}>
                  <DetailsTab flow={Flow.Detail} detailsData={detailsData} />
                </div>
              </TabPanel>
              <TabPanel value={TAB_OPTIONS.DEPLOYMENTS}>
                <div className={classes.deploymentsTab}>
                  <DeploymentsTab
                    deploymentsData={deploymentsData}
                    loading={loading}
                    refresh={refresh}
                    deploymentId={deploymentId}
                  />
                </div>
              </TabPanel>
              <TabPanel value={TAB_OPTIONS.MONITORING}>
                <div className={classes.monitoringTab}>
                  <MonitoringTab
                    appVersions={detailsData.compatibleAppVersionsSemver}
                    modelId={detailsData.id}
                  />
                </div>
              </TabPanel>
            </TabContext>
          </div>
        </>
      )}
    </div>
  )
}

export default ModelInfoComponent
