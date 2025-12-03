import {Box, Tab, Tabs, Typography} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {Icons} from '../../../../bit-components/icon/index'
import FeatureGroupDetailsHeader from '../../../../components/featureStore/featureGroupDetailsHeader'
import {FEATURE_TYPES} from '../../../../components/featureStore/featureGroupDetailsHeader/constants'
import SpinnerBackdrop from '../../../../components/spinnerBackdrop/spinnerBackdrop'
import {routes} from '../../../../constants'
import {CommonState} from '../../../../reducers/commonReducer'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {API_STATUS} from '../../../../utils/apiUtils'
import {logEvent} from '../../../../utils/events'
import {
  GetFeatureGroupDetailsInput,
  SelectionOnData as IFeatureGroupDetails
} from '../../graphqlAPIs/getFeatureGroupDetails'
import {getFeatureGroupDetails} from '../../graphqlAPIs/getFeatureGroupDetails/index.thunk'
import {setFeatureGroupDetails, setFeaturs} from './actions'
import {ITab, tabs} from './constants'
import styles from './indexJSS'
import {IFeatureGroupDetailsState} from './reducer'

interface IProps extends WithStyles<typeof styles> {
  match: any
  features: IFeatureGroupDetailsState['features']
  getFeatureGroupDetailsFunc: (payload: GetFeatureGroupDetailsInput) => void
  setFeatureGroupDetailsToDefault: () => void
  setFeaturesToDefault: () => void
  featureGroupDetails: {
    status: API_STATUS
    data: IFeatureGroupDetails
    error: any
  }
}
interface TabPanelProps extends WithStyles<typeof styles> {
  children?: React.ReactNode
  index: number
  value: number
}

const featureDetailsTabProps = (index: number) => ({
  id: `feature-tab-${index}`,
  'aria-controls': `feature-tabpanel-${index}`
})

const TabPanel = (props: TabPanelProps) => {
  const {children, value, classes, index, ...other} = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`feature-tabpanel-${index}`}
      aria-labelledby={`feature-tab-${index}`}
      {...other}
      className={value === index ? classes.dataBoxContent : ''}
    >
      {value === index && (
        <Box className={classes.dataBoxContent} sx={{p: 0, pt: '24px'}}>
          {children}
        </Box>
      )}
    </div>
  )
}

const featureStoreGroupDetails = (props: IProps) => {
  const {
    match,
    classes,
    getFeatureGroupDetailsFunc,
    setFeatureGroupDetailsToDefault,
    setFeaturesToDefault,
    featureGroupDetails,
    features
  } = props
  const history = useHistory()
  const {params, path} = match
  const {
    id: groupId,
    version: versionId,
    type: featureType,
    tab: selectedTab
  } = params
  const featureStoreType =
    featureType &&
    (featureType === FEATURE_TYPES.ONLINE ||
      featureType === FEATURE_TYPES.OFFLINE)
      ? featureType
      : FEATURE_TYPES.OFFLINE

  useEffect(() => {
    logEvent(EventTypes.FEATURE_STORE.DETAILS_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
    if (groupId && Number(versionId) && featureStoreType) {
      getFeatureGroupDetailsFunc({
        getFeatureGroupDetailsId: groupId,
        type: featureStoreType,
        version: Number(versionId)
      })
    }

    return () => {
      setFeatureGroupDetailsToDefault()
      setFeaturesToDefault()
    }
  }, [versionId, groupId, featureStoreType])

  const getTabIcon = (featureTabIdx: number) => {
    if (featureTabIdx === 0) {
      return (
        <div className={classes.featureCount}>
          {features?.totalRecordsCount || 0}
        </div>
      )
    } else if (featureTabIdx === 3) {
      return <span className={Icons.ICON_OPEN_IN_NEW} />
    }
    return null
  }

  const onTabChange = (_ev, newValue) => {
    history.replace(
      routes.feature
        .replaceAll(':id', featureGroupDetails.data?.id)
        .replaceAll(':version', featureGroupDetails.data?.version.toString())
        .replaceAll(':type', featureGroupDetails.data?.type)
        .replaceAll(':tab', newValue.toString())
    )
  }

  const isTabVisible = (tab: ITab) => {
    if (tab.type && tab.type !== featureGroupDetails?.data?.type) {
      return false
    }

    return true
  }

  return (
    <div className={classes.container}>
      <SpinnerBackdrop
        show={featureGroupDetails.status === API_STATUS.LOADING}
      />
      <FeatureGroupDetailsHeader />

      <Box className={classes.dataBox}>
        <Box className={classes.tabsBox}>
          <Tabs
            value={(selectedTab && Number(selectedTab)) || 0}
            onChange={onTabChange}
            aria-label='feature details tabs'
          >
            {tabs.map((tab, tabIdx) => (
              <Tab
                style={{display: !isTabVisible(tab) && 'none'}}
                label={tab.name}
                {...featureDetailsTabProps(tabIdx)}
                icon={getTabIcon(tabIdx)}
                iconPosition='end'
              />
            ))}
          </Tabs>
        </Box>
        {tabs.map((tab, tabIdx) => (
          <TabPanel
            key={tabIdx}
            classes={classes}
            value={(selectedTab && Number(selectedTab)) || 0}
            index={tabIdx}
          >
            {tab.Component && <tab.Component selectedTab={selectedTab} />}
          </TabPanel>
        ))}
      </Box>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  features: state.featureGroupDetailsReducer.features,
  featureGroupDetails: state.featureGroupDetailsReducer.featureGroupDetails
})

const mapDispatchToProps = (dispatch) => {
  return {
    getFeatureGroupDetailsFunc: (payload: GetFeatureGroupDetailsInput) =>
      getFeatureGroupDetails(dispatch, payload),
    setFeatureGroupDetailsToDefault: () =>
      dispatch(
        setFeatureGroupDetails({
          status: API_STATUS.INIT,
          data: null,
          error: null
        })
      ),
    setFeaturesToDefault: () =>
      dispatch(
        setFeaturs({
          status: API_STATUS.INIT,
          data: null,
          error: null,
          totalRecordsCount: 0
        })
      )
  }
}

const StyleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(featureStoreGroupDetails)

export default StyleComponent
