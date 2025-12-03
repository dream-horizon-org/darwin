import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import withStyles from '@mui/styles/withStyles'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import SearchBar from '../../../../components/searchBar'
import NoResultsFound from '../../../../components/workflows/noResultsFound'
import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {CommonState} from '../../../../reducers/commonReducer'
import debounce from '../../../../utils/debounce'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  GetFeatures,
  GetFeaturesInput
} from '../../../featureStoreV2/graphqlAPIs/getFeatures/index'
import {GQL as getFeaturesGql} from '../../../featureStoreV2/graphqlAPIs/getFeatures/indexGql'
import CircleLoader from '../../../login/circleLoader'
import {setInitialEventTableData} from '../../data/actions'
import {
  FeatureDataType,
  Flow,
  SelectedData,
  TEventTables,
  TFeatureGroupData,
  TFeatureGroupTables
} from '../../data/types'
import {TableTypeEnum} from '../../data/types'
import {hasExpiryInMins, hasFeatureTableDelta} from '../../data/utils'
import {
  ValidateEdgeTableName,
  ValidateEdgeTableNameInput
} from '../../graphQL/queries/validateEdgeTableName'
import {GQL as validateEdgeTableGql} from '../../graphQL/queries/validateEdgeTableName/indexGql'
import styles from '../AllEventsSchema/EventSelectionJSS'
import SqlQueryListing from '../AllEventsSchema/SqlQueryListing'
import {tableHeading} from './constants'
import FeatureSelection from './FeatureSelection'

function FeatureGroupSelectionImpl(props: {
  flow: Flow
  groupIdSelection: string
  onBackPress: () => void
  closeModal: () => void
  featureGroupTableDetails: TFeatureGroupData
  initialFeatureGroupTableDetails: TFeatureGroupTables
  classes
}) {
  const {
    flow,
    groupIdSelection,
    onBackPress,
    closeModal,
    featureGroupTableDetails,
    initialFeatureGroupTableDetails,
    classes
  } = props

  const [selected, setSelected] = useState<SelectedData>(new Map())
  const [searchValue, setSearchValue] = useState<string>('')
  const [featureData, setFeatureData] = useState<FeatureDataType>({
    loading: true,
    data: null,
    totalRows: null
  })
  const [defaultTableName, setDefaultTableName] = useState<string>(
    flow === Flow.CREATE || (flow === Flow.Edit && !featureGroupTableDetails)
      ? groupIdSelection
      : featureGroupTableDetails.tableName || groupIdSelection
  )

  const [showSqlQueries, setShowSqlQueries] = useState(false)

  const getFeatureList = async (payload: GetFeaturesInput) => {
    const gql = {
      ...getFeaturesGql,
      variables: payload
    }
    try {
      setFeatureData({
        loading: true,
        data: null,
        totalRows: null
      })

      const gqlResponse = await gqlRequestTyped<GetFeaturesInput, GetFeatures>(
        gql
      )

      if (gqlResponse.data.getFeatures.status === ApiStatus.SUCCESS) {
        setFeatureData({
          loading: false,
          data: gqlResponse.data.getFeatures.data,
          totalRows: gqlResponse.data.getFeatures.resultSize
        })
      }
    } catch (error) {
      setFeatureData({
        loading: false,
        data: null,
        totalRows: null
      })
    }
  }
  const getFeatureListDebounced = useMemo(
    () => debounce(getFeatureList, 1000),
    []
  )

  useEffect(() => {
    getFeatureListDebounced({
      searchString: searchValue,
      featureGroupId: groupIdSelection,
      pageSize: 100,
      offset: 0,
      sortBy: 'name',
      sortOrder: 'asc',
      type: 'online'
    })
  }, [groupIdSelection, searchValue])

  const handlePropSelection = (selectedData: SelectedData) => {
    setSelected(selectedData)
  }

  const handlePropNameSearch = (str: string) => {
    setSearchValue(str)
  }

  if (showSqlQueries) {
    return (
      <SqlQueryListing
        flow={flow}
        tableType={TableTypeEnum.FEATURE}
        eventTableDetails={undefined}
        featureGroupTableDetails={featureGroupTableDetails}
        selectedProps={selected}
        onBackPress={() => setShowSqlQueries(false)}
        tableName={defaultTableName}
        eventName={groupIdSelection}
        expiryTimeInSecs={undefined}
        closeModal={closeModal}
        appVersionSemver={undefined}
      />
    )
  }

  const showFallBack = featureData.totalRows && featureData.totalRows === 0

  return (
    <div className={classes.container}>
      <div className={classes.eventSelectionHeader}>
        <ArrowBackIcon className={classes.backButton} onClick={onBackPress} />
        <span className={classes.eventNameSpan}>{groupIdSelection}</span>
      </div>
      <div className={classes.searchRow}>
        <div className={classes.searchContainer}>
          <div className={classes.searchBarSection}>
            <SearchBar
              placeholder='Search By Feature Name'
              value={searchValue}
              onValueChange={handlePropNameSearch}
            />
          </div>
        </div>
      </div>

      <FeatureSelection
        flow={flow}
        featureGroupTableDetails={featureGroupTableDetails}
        featureProps={featureData}
        handlePropSelection={handlePropSelection}
      />

      {showFallBack ? <NoResultsFound /> : null}
      {featureData.data && (
        <FeatureTableFooter
          flow={flow}
          selectedFeatures={selected}
          featureGroupTableDetails={featureGroupTableDetails}
          initialFeatureGroupTableDetails={initialFeatureGroupTableDetails}
          handleFeatureTableNext={() => setShowSqlQueries(true)}
          handleTableNameChange={(e) => setDefaultTableName(e.target.value)}
          defaultTableName={defaultTableName}
          classes={classes}
        />
      )}
    </div>
  )
}

function FeatureTableFooter(props: {
  flow: Flow
  featureGroupTableDetails: TFeatureGroupData
  selectedFeatures: SelectedData
  initialFeatureGroupTableDetails: TFeatureGroupTables
  handleFeatureTableNext: () => void
  handleTableNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  defaultTableName: string
  classes
}) {
  const {
    flow,
    selectedFeatures,
    featureGroupTableDetails,
    initialFeatureGroupTableDetails,
    handleFeatureTableNext,
    handleTableNameChange,
    defaultTableName,
    classes
  } = props
  const length = selectedFeatures.size
  const propText = length > 0 ? `${length} Props - ` : ''

  const [validateTableName, setValidateTableName] = useState({
    isTableNameValid: true,
    isLoading: false
  })

  const [validateExpiryColumn, setValidateExpiryColumn] = useState({
    hasExpiryColumn: true,
    error: ''
  })

  const isEdgeTableNameValid = async (payload: ValidateEdgeTableNameInput) => {
    const gql = {
      ...validateEdgeTableGql,
      variables: payload
    }
    try {
      setValidateTableName({
        isTableNameValid: validateTableName.isTableNameValid,
        isLoading: true
      })
      const gqlResponse = gqlRequestTyped<
        ValidateEdgeTableNameInput,
        ValidateEdgeTableName
      >(gql)

      const isValidResponse = await gqlResponse
      setValidateTableName({
        isTableNameValid: validateTableName.isTableNameValid,
        isLoading: false
      })
      const responseData = isValidResponse.data?.validateEdgeTableName?.data

      if (!responseData) {
        return false
      }

      return responseData.tableNameExists === false
    } catch (error) {
      setValidateTableName({
        isTableNameValid: validateTableName.isTableNameValid,
        isLoading: false
      })
      return false
    }
  }

  useEffect(() => {
    if (length > 0 && !hasExpiryInMins(selectedFeatures)) {
      setValidateExpiryColumn({
        hasExpiryColumn: false,
        error: "'expiryTime' feature is required to create Feature table"
      })
      return
    }
    setValidateExpiryColumn({
      hasExpiryColumn: validateExpiryColumn.hasExpiryColumn,
      error: ''
    })
  }, [selectedFeatures])

  const checkForTableNameChange = (
    originalTable: TFeatureGroupData,
    featureGroupTableDetails: TFeatureGroupData
  ) => {
    return originalTable.tableName !== featureGroupTableDetails.tableName
  }

  const handleNext = async () => {
    setValidateTableName({
      isTableNameValid: true,
      isLoading: validateTableName.isLoading
    })

    if (flow === Flow.Edit && featureGroupTableDetails) {
      const originalTable = initialFeatureGroupTableDetails.data.find(
        (table) => table.tableName === featureGroupTableDetails.tableName
      )

      const hasDelta = hasFeatureTableDelta(originalTable, selectedFeatures)

      if (
        hasDelta ||
        checkForTableNameChange(originalTable, featureGroupTableDetails)
      ) {
        const isValid = await isEdgeTableNameValid({
          tableName: defaultTableName
        })
        if (!isValid) {
          setValidateTableName({
            isTableNameValid: false,
            isLoading: validateTableName.isLoading
          })
          return
        }
      }
    } else if (flow === Flow.CREATE || flow === Flow.Edit) {
      const isValid = await isEdgeTableNameValid({tableName: defaultTableName})
      if (!isValid) {
        setValidateTableName({
          isTableNameValid: false,
          isLoading: validateTableName.isLoading
        })
        return
      }
    }
    handleFeatureTableNext()
  }

  return (
    <div className={classes.footerContainer}>
      <div className={classes.footerLeft}>
        <span className={classes.labelText}>
          {propText}
          {tableHeading} &nbsp;
        </span>
        <TextField
          size='small'
          className={classes.textField}
          placeholder={tableHeading}
          variant='outlined'
          defaultValue={defaultTableName}
          onChange={handleTableNameChange}
          error={!validateTableName.isTableNameValid}
          helperText={
            !validateTableName.isTableNameValid ? 'Table already exists' : ''
          }
          disabled={validateTableName.isLoading}
        />
        {validateTableName.isLoading && <CircleLoader />}
      </div>
      <div className={classes.errorContainer}>{validateExpiryColumn.error}</div>
      <div className={classes.btnContainer}>
        <Button
          onClick={handleNext}
          disabled={length === 0 || !validateExpiryColumn.hasExpiryColumn}
          variant='contained'
          className={classes.buttonText}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setInitialEventTableDetails: (payload: TEventTables) => {
      dispatch(setInitialEventTableData(payload))
    }
  }
}

const mapStateToProps = (state: CommonState) => ({
  initialFeatureGroupTableDetails:
    state.edgeModelsReducer.initialFeatureGroupTableDetails
})

export const FeatureGroupSelection = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(FeatureGroupSelectionImpl)
