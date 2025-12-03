import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'

import {connect} from 'react-redux'
import {compose} from 'redux'
import {GetFeatureGroupEntitiesInput} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupEntities'
import {getFeatureGroupEntities} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupEntities/index.thunk'
import {IFeatureGroupDetailsState} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import Spinner from '../../spinner/spinner'
import EntityTable from '../entityTable'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  featureGroupEntities: IFeatureGroupDetailsState['featureGroupEntities']
  featureGroupDetails: IFeatureGroupDetailsState['featureGroupDetails']
  getFeatureGroupEntites: (data: GetFeatureGroupEntitiesInput) => void
}

const EntityList = (props: IProps) => {
  const {
    featureGroupEntities,
    featureGroupDetails,
    getFeatureGroupEntites,
    classes
  } = props

  useEffect(() => {
    if (
      featureGroupDetails?.data?.title &&
      featureGroupDetails?.data?.version
    ) {
      getFeatureGroupEntites({
        featureGroupName: featureGroupDetails?.data?.title,
        version: featureGroupDetails?.data?.version
      })
    }
  }, [featureGroupDetails])

  return (
    <>
      {featureGroupEntities?.status === API_STATUS.LOADING && (
        <Spinner show={true} size={50} />
      )}
      {featureGroupEntities?.status === API_STATUS.SUCCESS &&
        featureGroupEntities?.data && (
          <EntityTable featureGroupEntities={featureGroupEntities?.data} />
        )}
      {featureGroupEntities?.status === API_STATUS.ERROR && (
        <div className={classes.error}>
          Error! Failed to fetch records, try refreshing the page!
        </div>
      )}
    </>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroupDetails: state.featureGroupDetailsReducer.featureGroupDetails,
  featureGroupEntities: state.featureGroupDetailsReducer.featureGroupEntities
})

const mapDispatchToProps = (dispatch) => {
  return {
    getFeatureGroupEntites: (data: GetFeatureGroupEntitiesInput) =>
      getFeatureGroupEntities(dispatch, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(EntityList)

export default StyleComponent
