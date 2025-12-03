import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {useLocation, useParams} from 'react-router-dom'
import {compose} from 'redux'
import GlobalSpinner from '../../../../components/globalSpinner'
import {usePreventNavigation} from '../../../../hooks'
import {NavigationMode} from '../../../../hooks/src/usePreventNavigation/usePreventNavigation.hook'
import {CommonState} from '../../../../reducers/commonReducer'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped.js'
import CreateModelBody from '../../components/CreateModelBody'
import CreateModelFooter from '../../components/CreateModelFooter'
import CreateModelHeader from '../../components/CreateModelHeader'
import {
  setEditableObject,
  setInitialEventTableData,
  setInitialFeatureTableData
} from '../../data/actions'
import {clearEdgeModelDataState} from '../../data/index.thunk'
import {IEdgeModelsState} from '../../data/reducer'
import {Flow} from '../../data/types'
import {transformedDataType} from '../../data/types'
import {EditableObjectType} from '../../data/types'
import {TEventData, TEventTables, TFeatureGroupTables} from '../../data/types'
import {
  StatusEnum,
  transformDeploymentsData,
  transformDetailsData
} from '../../data/utils'
import {getEditableState} from '../../data/utils'
import type {
  GetModelDeploymentForId,
  GetModelDeploymentForIdInput
} from '../../graphQL/queries/getModelDeploymentForId/index.js'
import {GQL as detailsGQL} from '../../graphQL/queries/getModelDeploymentForId/indexGql.js'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  classes
  setEditableFields: (payload: IEdgeModelsState['isEditable']) => void
  setInitialEventTableDetails: (payload: TEventTables) => void
  setInitialFeatureGroupTableDetails: (payload: TFeatureGroupTables) => void
  clearEdgeModelData: () => void
}

const EdgeModelsEditPage = (props: IProps) => {
  const {
    classes,
    setEditableFields,
    setInitialEventTableDetails,
    setInitialFeatureGroupTableDetails,
    clearEdgeModelData
  } = props
  const {deploymentId} = useParams<any>()
  const [detailsData, setDetailsData] = useState<transformedDataType>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    return () => {
      clearEdgeModelData()
    }
  }, [])

  useEffect(() => {
    getModelDeploymentsForId()
  }, [deploymentId])

  useEffect(() => {
    if (!loading) {
      setEditableFields(
        getEditableState(
          detailsData.compatibleAppVersions.map((item) => {
            return StatusEnum[item.status as keyof typeof StatusEnum]
          })
        )
      )
    }
  }, [loading])

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
      setDetailsData(transformedDetails)
      setInitialEventTableDetails(transformedDetails.eventTables)
      setInitialFeatureGroupTableDetails(transformedDetails.featureGroupTables)
      setLoading(false)
    } catch (error) {}
  }
  return (
    <div className={classes.container}>
      <GlobalSpinner show={loading} />
      {!loading && (
        <>
          <CreateModelHeader flow={Flow.Edit} deploymentDetails={detailsData} />
          <div className={classes.body}>
            <CreateModelBody flow={Flow.Edit} deploymentDetails={detailsData} />
          </div>
          <CreateModelFooter flow={Flow.Edit} deploymentDetails={detailsData} />
        </>
      )}
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setEditableFields: (payload: IEdgeModelsState['isEditable']) => {
      dispatch(setEditableObject(payload))
    },
    setInitialEventTableDetails: (payload: TEventTables) => {
      dispatch(setInitialEventTableData(payload))
    },
    setInitialFeatureGroupTableDetails: (payload: TFeatureGroupTables) => {
      dispatch(setInitialFeatureTableData(payload))
    },
    clearEdgeModelData: () => {
      dispatch(clearEdgeModelDataState)
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  isEditable: state.edgeModelsReducer.isEditable,
  initialEventTableDetails: state.edgeModelsReducer.initialEventTableDetails,
  initialFeatureGroupTableDetails:
    state.edgeModelsReducer.initialFeatureGroupTableDetails
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(EdgeModelsEditPage)

export default styleComponent
