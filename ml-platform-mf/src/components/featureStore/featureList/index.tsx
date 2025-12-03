import {Drawer} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Search} from '../../../bit-components/search/index'
import {routes} from '../../../constants'
import {
  GetFeatures,
  GetFeaturesInput,
  SelectionOnData as IFeature
} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatures'
import {getFeatures} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatures/index.thunk'
import {GetProdUsageListInput} from '../../../modules/featureStoreV2/graphqlAPIs/getProdUsageList'
import {getProdUsageList} from '../../../modules/featureStoreV2/graphqlAPIs/getProdUsageList/index.thunk'
import {IFeatureGroupDetailsState} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import Spinner from '../../spinner/spinner'
import useQuery, {QueryParams} from '../../useQuery'
import FeaturesTable from '../featuresTable'
import {pageResultCount, searchInputPlaceholder} from './constants'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  selectedTab: number
  featureGroupDetails: IFeatureGroupDetailsState['featureGroupDetails']
  getFeaturesFunc: (
    payload: GetFeaturesInput,
    preLoadedData: GetFeatures['getFeatures']['data']
  ) => void
  features: IFeatureGroupDetailsState['features']
  getProdUsageListFunc: (payload: GetProdUsageListInput) => void
  prodUsageList: IFeatureGroupDetailsState['prodUsageList']
}

const FeatureList = (props: IProps) => {
  const {
    classes,
    selectedTab,
    featureGroupDetails,
    getFeaturesFunc,
    features,
    prodUsageList,
    getProdUsageListFunc
  } = props

  const query = useQuery()
  const history = useHistory()
  const [featureListPageNumber, setFeatureListPageNumber] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState<IFeature>(null)
  const searchQuery = query.get(QueryParams.QUERY) || ''
  const onSearchInput = (str) => {
    history.replace({
      pathname: routes.feature
        .replaceAll(':id', featureGroupDetails.data?.id)
        .replaceAll(':version', `${featureGroupDetails.data?.version}`)
        .replaceAll(':type', featureGroupDetails.data?.type)
        .replaceAll(':tab', selectedTab.toString()),
      search: `?${QueryParams.QUERY}=${str}`
    })
  }
  useEffect(() => {
    if (featureGroupDetails.data?.id) {
      setFeatureListPageNumber(0)
      features.cancel && features.cancel()
      getFeaturesFunc(
        {
          featureGroupId: featureGroupDetails.data?.id,
          offset: featureListPageNumber * pageResultCount,
          pageSize: pageResultCount,
          searchString: searchQuery,
          sortBy: 'name',
          sortOrder: 'asc',
          type: featureGroupDetails.data?.type,
          version: featureGroupDetails.data?.version
        },
        []
      )
    }
  }, [searchQuery, featureGroupDetails])

  useEffect(() => {
    if (featureListPageNumber && featureGroupDetails.data?.id) {
      getFeaturesFunc(
        {
          featureGroupId: featureGroupDetails.data?.id,
          offset: featureListPageNumber * pageResultCount,
          pageSize: pageResultCount,
          searchString: searchQuery,
          sortBy: 'name',
          sortOrder: 'asc',
          type: featureGroupDetails.data?.type,
          version: featureGroupDetails.data?.version
        },
        [...(features.data || [])]
      )
    }
  }, [featureListPageNumber])

  useEffect(() => {
    if (selectedFeature) {
      getProdUsageListFunc({
        featureGroupId: featureGroupDetails.data?.id,
        featureTitle: selectedFeature.title,
        type: featureGroupDetails.data?.type
      })
    }
  }, [selectedFeature])

  return (
    <div className={classes.container}>
      <Drawer
        anchor={'right'}
        open={Boolean(selectedFeature)}
        onClose={() => setSelectedFeature(null)}
      >
        <div className={classes.rightDrawerContainer}>
          <Spinner
            show={prodUsageList.status === API_STATUS.LOADING}
            size={40}
          />

          <div className={classes.drawerTitleContainer}>
            <div className={classes.drawerTitleIcon}>
              <IconButton
                onClick={() => setSelectedFeature(null)}
                leadingIcon={Icons.ICON_CLOSE}
                actionableVariants={
                  ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                }
                size={IconButtonSizes.LARGE}
                actionable={true}
                disabled={false}
              />
            </div>
            <div className={classes.drawerTitle}>{selectedFeature?.title}</div>
          </div>
          {prodUsageList.status === API_STATUS.SUCCESS ? (
            <div className={classes.drawerDataList}>
              {prodUsageList.data.map((prodUsage) => (
                <div key={prodUsage.title} className={classes.drawerDataRow}>
                  <div className={classes.dataIcon}></div>
                  <div className={classes.dataTitle}>{prodUsage.title}</div>
                  <div className={classes.dataLink}>
                    <a href={prodUsage.link} target='_blank' rel='noreferrer'>
                      <IconButton
                        onClick={() => {}}
                        leadingIcon={Icons.ICON_OPEN_IN_NEW}
                        actionableVariants={
                          ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                        }
                        size={IconButtonSizes.LARGE}
                        actionable={true}
                        disabled={false}
                      />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Drawer>
      <div className={classes.searchContainer}>
        <Search
          initiaValue={searchQuery || ''}
          onSearch={onSearchInput}
          onChangeForSearchBy={onSearchInput}
          placeholder={searchInputPlaceholder}
          disabled={featureGroupDetails.status === API_STATUS.LOADING}
        />
      </div>
      {features?.status === API_STATUS.LOADING && (
        <div className={classes.loader}>
          <Spinner show={true} size={50} />
        </div>
      )}
      {features?.data?.length > 0 && (
        <FeaturesTable
          setFeatureListPageNumber={setFeatureListPageNumber}
          featureListPageNumber={featureListPageNumber}
          pageResultCount={pageResultCount}
          setSelectedFeature={(feature: IFeature) =>
            setSelectedFeature(feature)
          }
        />
      )}
      {features?.status === API_STATUS.SUCCESS && features?.data?.length === 0 && (
        <div className={classes.noResultsFound}>
          <p>No Results Found!</p>
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroupDetails: state.featureGroupDetailsReducer.featureGroupDetails,
  features: state.featureGroupDetailsReducer.features,
  prodUsageList: state.featureGroupDetailsReducer.prodUsageList
})

const mapDispatchToProps = (dispatch) => {
  return {
    getFeaturesFunc: (
      payload: GetFeaturesInput,
      preLoadedData: GetFeatures['getFeatures']['data']
    ) => getFeatures(dispatch, payload, preLoadedData),
    getProdUsageListFunc: (payload: GetProdUsageListInput) =>
      getProdUsageList(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(FeatureList)

export default StyleComponent
