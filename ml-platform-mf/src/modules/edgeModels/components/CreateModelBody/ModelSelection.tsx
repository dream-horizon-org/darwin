import Modal from '@mui/material/Modal'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dropdown} from '../../../../bit-components/dropdown/index'
import {Icons} from '../../../../bit-components/icon/index'
import {Input} from '../../../../bit-components/input/index'
import CodespacePathSelectionModal from '../../../../components/workflows/codespacePathSelectionModal'
import {CommonState} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  deleteEventTableData,
  deleteEventTableProp,
  deleteFeatureTableData,
  deleteFeatureTableProp,
  setConfiFileData,
  setEventTableData,
  setFeatureTableData,
  setMLFlowModelDetails,
  setTestDataFileData
} from '../../data/actions'
import {setCompatibleAppVersionsData} from '../../data/index.thunk'
import {
  getFeatureComputeData,
  getTestDataFileContents
} from '../../data/index.thunk.js'
import {IEdgeModelsState} from '../../data/reducer'
import {
  TEventData,
  TEventTables,
  TFeatureGroupData,
  TFeatureGroupTables
} from '../../data/types'
import {Flow} from '../../data/types'
import {transformedDataType} from '../../data/types'
import {Mutation, MutationInput} from '../../graphQL/mutations/getFileContents'
import {GetAppVersions} from '../../graphQL/queries/getAppVersions'
import {GQL as appVersionGql} from '../../graphQL/queries/getAppVersions/indexGql.js'
import {getMLFlowModelVersionsApi} from '../../graphQL/queries/mlflow/getMLFlowModelVersions/index.thunk'
import {getMLFlowRegisteredModelsApi} from '../../graphQL/queries/mlflow/getMLFlowRegisteredModels/index.thunk'
import {AllEventsSchema} from '../AllEventsSchema'
import FeatureGroupsListing from '../FeatureGroupsListing'
import {CompatibleServiceSection} from './CompatibleServiceSection'
import {EventTableDetailsSection} from './EventTableDetailsSection'
import {FeatureTableDetailsSection} from './FeatureTableDetailsSection'
import styles from './ModelSelectionJSS'

interface IProps extends WithStyles<typeof styles> {
  flow: Flow
  deploymentDetails: transformedDataType
  configFilePath: string
  testDataFilePath: string
  mlFlowRegisteredModels: IEdgeModelsState['mlFlowRegisteredModels']
  mlFlowModelVersions: IEdgeModelsState['mlFlowModelVersions']
  mlFlowModelInfo: IEdgeModelsState['mlFlowModelDetails']
  eventTablesDetails: IEdgeModelsState['eventTablesDetails']
  featureGroupTablesDetails: IEdgeModelsState['featureGroupTablesDetails']
  compatibleAppVersions: string[]
  isEditable: IEdgeModelsState['isEditable']
  setConfigFilePath: (configFilePath: string) => void
  setTestDataFilePath: (testDataFilePath: string) => void
  getMLFlowRegisteredModels: () => void
  getMLFlowModelVersions: (payload) => void
  setMLFlowModelInfo: (payload) => void
  setCompatibleAppVersions: (payload: string[]) => void
  setEventTableDetailsData: (payload: TEventTables) => void
  deleteEventTableDetailsData: (payload: string) => void
  deleteEventTableDetailsProp: (payload: {
    tableName: string
    propName: string
  }) => void
  setFeatureTableDetailsData: (payload: TFeatureGroupTables) => void
  deleteFeatureTableDetailsData: (payload: string) => void
  deleteFeatureTableDetailsProp: (payload: {
    tableName: string
    featureName: string
  }) => void
  getFeatureComputeFileData: (payload: MutationInput) => void
  getTestData: (payload: MutationInput) => void
}

function ModelSelectionImpl(props: IProps) {
  const {
    flow,
    deploymentDetails,
    configFilePath,
    testDataFilePath,
    mlFlowRegisteredModels,
    mlFlowModelVersions,
    mlFlowModelInfo,
    eventTablesDetails,
    featureGroupTablesDetails,
    compatibleAppVersions,
    setConfigFilePath,
    setTestDataFilePath,
    getMLFlowRegisteredModels,
    getMLFlowModelVersions,
    setMLFlowModelInfo,
    setCompatibleAppVersions,
    setEventTableDetailsData,
    deleteEventTableDetailsData,
    deleteEventTableDetailsProp,
    setFeatureTableDetailsData,
    deleteFeatureTableDetailsData,
    deleteFeatureTableDetailsProp,
    getFeatureComputeFileData,
    getTestData,
    isEditable,
    classes
  } = props
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [showEventSchemaDialog, setShowEventSchemaDialog] =
    React.useState(false)
  const [isOpen, setIsOpen] = React.useState({
    configFilePath: false,
    testDataFilePath: false
  })
  const [compatibleAppVersionsResp, setCompatibleAppVersionsResp] =
    React.useState([])

  const [targetedEventData, setTargetedEventData] =
    React.useState<TEventData>(null)

  const [isLoadingModelVersions, setIsLoadingModelVersions] =
    React.useState(false)

  // new states
  const [showFeatureGroupsDialog, setShowFeatureGroupsDialog] =
    React.useState(false)

  const [targetedFeatureData, setTargetedFeatureData] =
    React.useState<TFeatureGroupData>(null)

  const isEditFlow = flow === Flow.Edit
  const isDetailsFlow = flow === Flow.Detail

  const isCreateFlow = flow === Flow.CREATE

  const handleShowDialog = (showDialog: boolean) => {
    setShowEventSchemaDialog(showDialog)
  }

  const handleShowFeatureGroupsDialog = (showDialog: boolean) => {
    setShowFeatureGroupsDialog(showDialog)
  }

  const openPathModal = (
    event: React.FocusEvent<HTMLInputElement>,
    name: string
  ) => {
    setIsOpen({...isOpen, [name]: true})
    event.target.blur()
    setIsDialogOpen(true)
  }

  const setValue = (value: string) => {
    if (isOpen.configFilePath) {
      setConfigFilePath(value)
      getFeatureComputeFileData({sourcePath: value})
    } else if (isOpen.testDataFilePath) {
      setTestDataFilePath(value)
      getTestData({sourcePath: value})
    }
    setIsOpen({configFilePath: false, testDataFilePath: false})
  }

  const getEventSchema = async () => {
    const appVersionGqlResponse = gqlRequestTyped<null, GetAppVersions>(
      appVersionGql
    )

    try {
      const response = await appVersionGqlResponse
      const versions = response.data?.getAppVersions?.data?.versions
      setCompatibleAppVersionsResp(versions)
    } catch (error) {}
  }

  const loadModelData = () => {
    getMLFlowRegisteredModels()
    getEventSchema()

    if (deploymentDetails && !isCreateFlow) {
      setEventTableDetailsData(deploymentDetails.eventTables)
      setConfigFilePath(deploymentDetails.configFilePath)
      setTestDataFilePath(deploymentDetails.testDataPath)
      setCompatibleAppVersions(deploymentDetails.compatibleAppVersionsSemver)
      setFeatureTableDetailsData(deploymentDetails.featureGroupTables)
    }

    if (isEditFlow) {
      setIsLoadingModelVersions(true)
      getMLFlowModelVersions({modelName: deploymentDetails.mlFlowModel})
      if (deploymentDetails.configFilePath) {
        getFeatureComputeFileData({
          sourcePath: deploymentDetails.configFilePath
        })
      }
      if (deploymentDetails.testDataPath) {
        getTestData({sourcePath: deploymentDetails.testDataPath})
      }
    }
  }
  useEffect(() => {
    loadModelData()
  }, [flow, deploymentDetails])

  useEffect(() => {
    if (
      isEditFlow &&
      mlFlowModelVersions?.status === 0 &&
      isLoadingModelVersions &&
      deploymentDetails
    ) {
      setIsLoadingModelVersions(false)

      const selectedVersion = mlFlowModelVersions?.data?.find(
        (item) => item.version === deploymentDetails.mlFlowVersion.toString()
      )

      if (selectedVersion) {
        setMLFlowModelInfo({
          ...mlFlowModelInfo,
          name: deploymentDetails.mlFlowModel,
          version: deploymentDetails.mlFlowVersion.toString(),
          run_id: selectedVersion.run_id
        })
      }
    }
  }, [mlFlowModelVersions, isLoadingModelVersions, deploymentDetails])

  const handleEventTableRowDelete = (tableIndex: number, rowIndex: number) => {
    const eventTable = eventTablesDetails.data[tableIndex]
    const eventProp = eventTable.eventData.props[rowIndex]
    deleteEventTableDetailsProp({
      tableName: eventTable.tableName,
      propName: eventProp.propName
    })
  }

  const handleEventTableDelete = (tableIndex: number) => {
    deleteEventTableDetailsData(eventTablesDetails.data[tableIndex].tableName)
  }

  const handleFeatureTableRowDelete = (
    tableIndex: number,
    rowIndex: number
  ) => {
    const featureGroupTable = featureGroupTablesDetails.data[tableIndex]
    const featureProp = featureGroupTable.featureGroupData.features[rowIndex]
    deleteFeatureTableDetailsProp({
      tableName: featureGroupTable.tableName,
      featureName: featureProp.featureName
    })
  }

  const handleFeatureTableDelete = (tableIndex: number) => {
    deleteFeatureTableDetailsData(
      featureGroupTablesDetails.data[tableIndex].tableName
    )
  }

  const modelsData = mlFlowRegisteredModels?.data || []
  const modelVersions = mlFlowModelVersions?.data || []
  const isModelVersionEnabled =
    mlFlowModelVersions.status === API_STATUS.SUCCESS

  const showFeatureGroupsDetailsSection =
    !(!isCreateFlow && !(featureGroupTablesDetails.data?.length > 0)) ||
    isEditFlow

  return (
    <>
      <div className={classes.sectionWrapper}>
        <div className={classes.modelSection}>
          <h5 style={{color: '#D9D9D9'}}>Model Selection</h5>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {/* <span style={{background: 'red'}}>
              <button
                onClick={() => {
                  getFeatureComputeFileData({sourcePath: 'depAmt/fc.json'})
                  getTestData({sourcePath: 'depAmt/test.json'})
                }}
              >
                {'exec'}
              </button>
            </span> */}
            <div style={{width: '49%'}}>
              <Dropdown
                onChange={(e, values) => {
                  if (!values && mlFlowModelInfo.name) {
                    setMLFlowModelInfo({
                      ...mlFlowModelInfo,
                      name: '',
                      version: ''
                    })
                    getMLFlowModelVersions({modelName: ''})
                    return
                  }
                  setMLFlowModelInfo({
                    ...mlFlowModelInfo,
                    name: values.value
                  })
                  getMLFlowModelVersions({modelName: values.value})
                }}
                menuLists={modelsData.map((model) => {
                  return {label: model.name, value: model.name}
                })}
                label={'Model Name'}
                disabled={
                  isDetailsFlow || (isEditFlow && !isEditable.modelSelection)
                }
                defaultValue={
                  !isCreateFlow
                    ? {
                        label: deploymentDetails.mlFlowModel,
                        value: deploymentDetails.mlFlowModel
                      }
                    : undefined
                }
                fieldVariant='withOutline'
              />
            </div>
            <div style={{width: '49%'}}>
              <Dropdown
                onChange={(e, values) => {
                  if (!values) {
                    return
                  }
                  setMLFlowModelInfo({
                    ...mlFlowModelInfo,
                    version: values.value.version,
                    run_id: values.value.run_id
                  })
                }}
                menuLists={modelVersions.map((mVersion) => {
                  return {
                    label: mVersion.version,
                    value: {
                      version: mVersion.version,
                      run_id: mVersion.run_id
                    }
                  }
                })}
                label={'Model Version'}
                disabled={
                  !isModelVersionEnabled ||
                  isDetailsFlow ||
                  (isEditFlow && !isEditable.modelSelection)
                }
                defaultValue={
                  !isCreateFlow
                    ? {
                        label: deploymentDetails.mlFlowVersion.toString(),
                        value: {
                          version: deploymentDetails.mlFlowVersion.toString(),
                          run_id: deploymentDetails.mlFlowVersion.toString()
                        }
                      }
                    : undefined
                }
              />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 16
            }}
          >
            <div style={{width: '49%'}}>
              <Input
                name='path'
                label='Feature Compute File'
                onFocus={(e) => openPathModal(e, 'configFilePath')}
                onChange={(ev) => {}}
                icon={Icons.ICON_NAVIGATE_NEXT}
                value={configFilePath}
                disabled={
                  isDetailsFlow || (isEditFlow && !isEditable.modelSelection)
                }
              />
            </div>
            <div style={{width: '49%'}}>
              <Input
                name='path'
                label='Test Data File'
                onFocus={(e) => openPathModal(e, 'testDataFilePath')}
                onChange={(ev) => {}}
                icon={Icons.ICON_NAVIGATE_NEXT}
                value={testDataFilePath}
                disabled={
                  isDetailsFlow || (isEditFlow && !isEditable.modelSelection)
                }
              />
            </div>
          </div>
        </div>
        <EventTableDetailsSection
          flow={flow}
          isEditable={isEditable}
          eventTablesDetails={eventTablesDetails}
          setTargetedEventData={isEditFlow ? setTargetedEventData : undefined}
          setShowEventSchemaDialog={setShowEventSchemaDialog}
          compatibleAppVersionsResp={compatibleAppVersionsResp}
          handleEventTableRowDelete={handleEventTableRowDelete}
          handleEventTableDelete={handleEventTableDelete}
          classes={classes}
        />
        {showFeatureGroupsDetailsSection && (
          <FeatureTableDetailsSection
            flow={flow}
            isEditable={isEditable}
            featureGroupTablesDetails={featureGroupTablesDetails}
            setTargetedFeatureData={
              isEditFlow ? setTargetedFeatureData : undefined
            }
            setShowFeatureGroupsDialog={setShowFeatureGroupsDialog}
            handleFeatureTableRowDelete={handleFeatureTableRowDelete}
            handleFeatureTableDelete={handleFeatureTableDelete}
            classes={classes}
          />
        )}

        <CompatibleServiceSection
          flow={flow}
          isEditable={isEditable}
          compatibleAppVersionsResp={compatibleAppVersionsResp}
          compatibleAppVersions={compatibleAppVersions}
          setCompatibleAppVersions={setCompatibleAppVersions}
          classes={classes}
        />
      </div>
      {isDialogOpen && (
        <CodespacePathSelectionModal
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          setSelectedNotebookPath={(val: string) => {
            setValue(val)
          }}
        />
      )}
      {showEventSchemaDialog && (
        <Modal
          open={showEventSchemaDialog}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <div className={classes.modalContainer}>
            <AllEventsSchema
              flow={flow}
              eventTableDetails={isEditFlow ? targetedEventData : undefined}
              handleModalClose={setShowEventSchemaDialog}
              compatibleAppVersionsResp={compatibleAppVersionsResp}
              handleShowDialog={handleShowDialog}
            />
          </div>
        </Modal>
      )}
      {showFeatureGroupsDialog && (
        <Modal
          open={showFeatureGroupsDialog}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <div className={classes.modalContainer}>
            <FeatureGroupsListing
              flow={flow}
              featureGroupTableDetails={
                isEditFlow ? targetedFeatureData : undefined
              }
              handleModalClose={setShowFeatureGroupsDialog}
              handleShowDialog={handleShowFeatureGroupsDialog}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setConfigFilePath: (configFilePath: string) => {
      dispatch(setConfiFileData(configFilePath))
    },
    setTestDataFilePath: (testDataFilePath: string) => {
      dispatch(setTestDataFileData(testDataFilePath))
    },
    getMLFlowRegisteredModels: () => {
      dispatch(getMLFlowRegisteredModelsApi)
    },
    getMLFlowModelVersions: (payload) => {
      getMLFlowModelVersionsApi(dispatch, payload)
    },
    setMLFlowModelInfo: (payload) => {
      dispatch(setMLFlowModelDetails(payload))
    },
    setCompatibleAppVersions: (payload) => {
      setCompatibleAppVersionsData(dispatch, payload)
    },
    setEventTableDetailsData: (payload: TEventTables) => {
      dispatch(setEventTableData(payload))
    },
    deleteEventTableDetailsData: (payload: string) => {
      dispatch(deleteEventTableData(payload))
    },
    deleteEventTableDetailsProp: (payload: {
      tableName: string
      propName: string
    }) => {
      dispatch(deleteEventTableProp(payload))
    },
    setFeatureTableDetailsData: (payload: TFeatureGroupTables) => {
      dispatch(setFeatureTableData(payload))
    },
    deleteFeatureTableDetailsData: (payload: string) => {
      dispatch(deleteFeatureTableData(payload))
    },
    deleteFeatureTableDetailsProp: (payload: {
      tableName: string
      featureName: string
    }) => {
      dispatch(deleteFeatureTableProp(payload))
    },
    getFeatureComputeFileData: (payload: MutationInput) => {
      getFeatureComputeData(dispatch, payload)
    },
    getTestData: (payload: MutationInput) => {
      getTestDataFileContents(dispatch, payload)
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  configFilePath: state.edgeModelsReducer.configFilePath,
  testDataFilePath: state.edgeModelsReducer.testDataFilePath,
  mlFlowRegisteredModels: state.edgeModelsReducer.mlFlowRegisteredModels,
  mlFlowModelVersions: state.edgeModelsReducer.mlFlowModelVersions,
  mlFlowModelInfo: state.edgeModelsReducer.mlFlowModelDetails,
  eventTablesDetails: state.edgeModelsReducer.eventTablesDetails,
  featureGroupTablesDetails: state.edgeModelsReducer.featureGroupTablesDetails,
  compatibleAppVersions: state.edgeModelsReducer.compatibleAppVersions,
  isEditable: state.edgeModelsReducer.isEditable
})
const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ModelSelectionImpl)

export default styleComponent
