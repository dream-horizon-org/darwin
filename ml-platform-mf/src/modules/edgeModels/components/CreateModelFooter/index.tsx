import Button from '@mui/material/Button'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {routes} from '../../../../constants'
import {CommonState} from '../../../../reducers/commonReducer'
import {clearEdgeModelDataState} from '../../data/index.thunk'
import {EditableObjectType, ICreateDataProps} from '../../data/types'
import {
  combineEventTables,
  combineFeatureGroupTables,
  createModelDeploymentApi,
  isCreateModelDataValid,
  transformFeatureCompute,
  transformTestData,
  updateModelDeploymentApi
} from '../../data/utils'

import {validateFCSchema, validateTDSchema} from '../../data/schema'

import {WithStyles, withStyles} from '@mui/styles'
import {compose} from 'redux'
import {usePreventNavigation} from '../../../../hooks'
import {useSQLite} from '../../../../hooks'
import {NavigationMode} from '../../../../hooks/src/usePreventNavigation/usePreventNavigation.hook'
import CircleLoader from '../../../login/circleLoader'
import {Flow} from '../../data/types'
import {
  FeatureComputeQueriesType,
  TestDataType,
  TEventTables,
  transformedDataType
} from '../../data/types'
import {
  areVectorsEqual,
  getEventTableInsertQueries,
  getEventTablesCreateQueries,
  getTempTableInsertQueries
} from '../../data/utils'
import styles from './indexJSS'

import {FCValidationPhases} from '../../data/constants'

import {IEdgeModelsState} from '../../data/reducer'

export interface IProps extends ICreateDataProps, WithStyles<typeof styles> {
  clearEdgeModelData: () => void
  flow: Flow
  deploymentDetails: transformedDataType
  eventTablesDetails: TEventTables
  testDataFileContent: IEdgeModelsState['testDataFileContent']
  configFileData: IEdgeModelsState['configFileData']
  isEditable: EditableObjectType
}

export const CreateModelFooterImpl = (props: IProps) => {
  const {
    clearEdgeModelData,
    flow,
    deploymentDetails,
    eventTablesDetails,
    classes,
    isEditable,
    testDataFileContent,
    configFileData
  } = props
  const history = useHistory()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  useEffect(() => {
    setError('')
  }, [eventTablesDetails, testDataFileContent, configFileData])

  const {executeQuery, clearDB, dbInitErrorMessage} = useSQLite()

  const isDatabaseInitialized = (): boolean => {
    if (dbInitErrorMessage) {
      setError(dbInitErrorMessage)
      return false
    }
    return true
  }

  const executeQueries = (queries: string[], stepName: string): boolean => {
    for (const query of queries) {
      try {
        executeQuery(query)
      } catch (err) {
        setError(
          `${stepName} failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
        return false
      }
    }
    return true
  }

  const runEventTableCreationQueries = (
    eventTablesDetails: TEventTables
  ): boolean => {
    const queries = getEventTablesCreateQueries(eventTablesDetails)
    // const queries = [
    //   'CREATE TABLE IF NOT EXISTS DepositSuccessClient (userid INTEGER, created_at INTEGER, amount REAL);',
    //   'CREATE TABLE IF NOT EXISTS CashAddInitiated (userid INTEGER, created_at INTEGER, newamount REAL, oldamount INTEGER, newprefilledamt INTEGER);'
    // ]
    return executeQueries(queries, FCValidationPhases.EVENT_TABLE_CREATION)
  }

  const runTempTableCreationQueries = (
    featureComputeQueries: FeatureComputeQueriesType
  ): boolean => {
    const queries = featureComputeQueries.tempTables.map((i) => i.query)
    return executeQueries(queries, FCValidationPhases.TEMP_TABLE_CREATION)
  }

  const runTempTableInsertQueries = (testData: TestDataType): boolean => {
    const queries = getTempTableInsertQueries(testData.gqlData)
    return executeQueries(queries, FCValidationPhases.TEMP_TABLE_DATA_INSERTION)
  }

  const runEventTableInsertQueries = (
    testData: TestDataType,
    eventTablesDetails: TEventTables
  ): boolean => {
    const queries = getEventTableInsertQueries(
      testData.eventsData,
      eventTablesDetails?.data
    )
    return executeQueries(
      queries,
      FCValidationPhases.EVENT_TABLE_DATA_INSERTION
    )
  }

  const processInputQueries = (
    featureComputeQueries: FeatureComputeQueriesType
  ): {
    success: boolean
    inputMatrix: unknown[]
  } => {
    const inputMatrix = []
    const inputQueriesMap = new Map(
      featureComputeQueries?.inputs?.map(({name, queries}) => [name, queries])
    )
    for (const [name, queries] of inputQueriesMap) {
      for (const query of queries) {
        try {
          const result = executeQuery(query)
          if (result?.length > 0) {
            inputMatrix.push(result[0].values)
          }
        } catch (err) {
          setError(
            `Processing input queries for ${name} failed: ${
              err instanceof Error ? err.message : String(err)
            }`
          )
          return {success: false, inputMatrix: []}
        }
      }
    }
    return {success: true, inputMatrix}
  }

  const validate = (): boolean => {
    if (!configFileData.success) {
      setError(configFileData.message)
      return false
    }
    if (!testDataFileContent.success) {
      setError(testDataFileContent.message)
      return false
    }

    const featureComputeFile = validateFCSchema(configFileData.data)
    const testDataFile = validateTDSchema(testDataFileContent.data)

    if (!featureComputeFile && !testDataFile) {
      setError(
        'Schema validation failed for feature compute and test data files'
      )
      return false
    } else if (!featureComputeFile) {
      setError('Schema validation failed for feature compute file')
      return false
    } else if (!testDataFile) {
      setError('Schema validation failed for test data file')
      return false
    }
    const featureCompute = transformFeatureCompute(configFileData.data)
    const testData = transformTestData(testDataFileContent.data)

    if (!isDatabaseInitialized()) return false
    clearDB()
    if (!runEventTableCreationQueries(eventTablesDetails)) return false
    if (!runTempTableCreationQueries(featureCompute)) return false
    if (!runTempTableInsertQueries(testData)) return false
    if (!runEventTableInsertQueries(testData, eventTablesDetails)) return false
    const result = processInputQueries(featureCompute)
    if (!result.success) return false

    const areInputsEqual = areVectorsEqual(
      result.inputMatrix,
      testData.predict.input,
      testData.predict.delta
    )
    if (!areInputsEqual) {
      setError('inputs to model failed to match with test data')
      return false
    }
    return true
  }

  const {bypassGuard} = usePreventNavigation(
    'Are you sure?',
    'Are you sure you want to exit ? You will lose all unsaved changes.',
    NavigationMode.PUSH
  )

  const handleValidateAndSubmit = async () => {
    const reqInputData = {
      deploymentName: props.isModelNameValid.data.deploymentName,
      mlFlowModelName: props.mlFlowModelInfo.name,
      mlFlowModelVersion: props.mlFlowModelInfo.version,
      mlFlowModelVersionRunId: props.mlFlowModelInfo.run_id,
      deploymentTags: props.deploymentTags,
      configFilePath: props.configFilePath,
      testDataPath: props.testDataFilePath,
      compatibleAppVersions: props.compatibleAppVersions,
      eventTablesDetails: props.eventTablesDetails,
      featureGroupTablesDetails: props.featureGroupTablesDetails
    }

    try {
      setError('')
      setLoading(true)
      const depId = await createModelDeploymentApi(reqInputData)
      setLoading(false)
      if (depId) {
        clearEdgeModelData()
        bypassGuard(`${routes.edgeModels}`)
      }
    } catch (error) {
      setLoading(false)
      setError(error?.message)
    }
  }

  const handleValidateAndSubmitEdit = async () => {
    const reqInputData = {
      deploymentID: deploymentDetails.id,
      deploymentName: props.isModelNameValid.data.deploymentName,
      mlFlowModelName: props.mlFlowModelInfo.name,
      mlFlowModelVersion: props.mlFlowModelInfo.version,
      mlFlowModelVersionRunId: props.mlFlowModelInfo.run_id,
      deploymentTags: props.deploymentTags,
      configFilePath: props.configFilePath,
      testDataPath: props.testDataFilePath,
      compatibleAppVersions: props.compatibleAppVersions,
      eventTablesDetails: combineEventTables(
        props.eventTablesDetails,
        deploymentDetails.eventTables
      ),
      featureGroupTablesDetails: combineFeatureGroupTables(
        props.featureGroupTablesDetails,
        deploymentDetails.featureGroupTables
      )
    }
    try {
      setError('')
      setLoading(true)
      const success = await updateModelDeploymentApi(reqInputData)
      setLoading(false)
      if (success) {
        clearEdgeModelData()
        bypassGuard(`${routes.edgeModels}`)
      }
    } catch (error) {
      setLoading(false)
      setError(error?.message)
    }
  }

  const submitHandler = () => {
    const isEditableFields = Object.values(isEditable)
    const allEditableFalse = isEditableFields.every((field) => !field)

    const valid = validate()
    if (!valid) return

    if (flow === Flow.CREATE) {
      handleValidateAndSubmit()
    } else {
      if (allEditableFalse) {
        setError('Deployment details cannot be edited')
        return
      }
      handleValidateAndSubmitEdit()
    }
  }

  const handleCancel = () => {
    clearEdgeModelData()
    history.push(`${routes.edgeModels}`)
  }

  const isFileFetched = testDataFileContent.success && configFileData.success

  const isValid = isCreateModelDataValid(props) && isFileFetched

  return (
    <div className={classes.actionBar}>
      <div className={classes.errorContainer}>{error}</div>
      <div className={classes.submitAndCancelContainer}>
        {loading ? (
          <div className={classes.circleLoader}>
            <CircleLoader />
          </div>
        ) : (
          <>
            <div className={classes.actionBarBtnWrapper}>
              <Button onClick={handleCancel} className={classes.cancelButton}>
                Cancel
              </Button>
            </div>
            <div className={classes.actionBarBtnWrapper}>
              <Button
                onClick={() => submitHandler()}
                variant='contained'
                disabled={!isValid}
                className={classes.submitButton}
              >
                Validate and Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearEdgeModelData: () => {
      dispatch(clearEdgeModelDataState)
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  configFilePath: state.edgeModelsReducer.configFilePath,
  configFileData: state.edgeModelsReducer.configFileData,
  testDataFilePath: state.edgeModelsReducer.testDataFilePath,
  testDataFileContent: state.edgeModelsReducer.testDataFileContent,
  mlFlowModelInfo: state.edgeModelsReducer.mlFlowModelDetails,
  eventTablesDetails: state.edgeModelsReducer.eventTablesDetails,
  featureGroupTablesDetails: state.edgeModelsReducer.featureGroupTablesDetails,
  isModelNameValid: state.edgeModelsReducer.isModelNameValid,
  deploymentTags: state.edgeModelsReducer.deploymentTags,
  compatibleAppVersions: state.edgeModelsReducer.compatibleAppVersions,
  isEditable: state.edgeModelsReducer.isEditable
})

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(CreateModelFooterImpl)

export default styleComponent
