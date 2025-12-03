import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {CommonState} from '../../../../reducers/commonReducer'
import ModelInfo from '../../components/ModelInfo'
import {clearEdgeModelDataState} from '../../data/index.thunk'
import styles from './indexJSS'

export interface IProps extends WithStyles<typeof styles> {
  clearEdgeModelData: () => void
  classes
}

const EdgeModelsInfoPage = ({clearEdgeModelData, classes}) => {
  useEffect(() => {
    return () => {
      clearEdgeModelData()
    }
  }, [])
  return <ModelInfo classes={classes} />
}

const mapStateToProps = (state: CommonState) => ({
  configFilePath: state.edgeModelsReducer.configFilePath,
  testDataFilePath: state.edgeModelsReducer.testDataFilePath,
  mlFlowModelInfo: state.edgeModelsReducer.mlFlowModelDetails,
  eventTablesDetails: state.edgeModelsReducer.eventTablesDetails,
  isModelNameValid: state.edgeModelsReducer.isModelNameValid,
  deploymentTags: state.edgeModelsReducer.deploymentTags,
  compatibleAppVersions: state.edgeModelsReducer.compatibleAppVersions
})

const mapDispatchToProps = (dispatch) => {
  return {
    clearEdgeModelData: () => {
      dispatch(clearEdgeModelDataState)
    }
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(EdgeModelsInfoPage)

export default styleComponent
