import Close from '@mui/icons-material/Close'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  GetFeatureGroups,
  GetFeatureGroupsInput
} from '../../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroups'
import {CommonState} from '../../../../reducers/commonReducer'
import {Flow} from '../../data/types.js'
import {TEventData, TFeatureGroupData} from '../../data/types.js'

import {Datatable} from '../../../../bit-components/datatable/index'
import {TableCellSize} from '../../../../bit-components/table-cells/tc-cell/index'
import SearchBar from '../../../../components/searchBar'
import NoResultsFound from '../../../../components/workflows/noResultsFound'
import {API_STATUS} from '../../../../utils/apiUtils'
import {getFeatureGroups} from '../../data/index.thunk.js'
import {IEdgeModelsState} from '../../data/reducer'
import {featureGroupsListingColumnConfig} from './featureGroupListingColumnConfig'
import {FeatureGroupSelection} from './FeatureGroupSelection'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  getFeatureGroupsFunc: (
    payload: GetFeatureGroupsInput,
    preLoadedData: GetFeatureGroups['getFeatureGroups']['data']
  ) => void
  handleModalClose: (value: boolean) => void
  flow: Flow
  featureGroups: IEdgeModelsState['featureGroups']
  featureGroupTableDetails: TFeatureGroupData
  handleShowDialog: (showDialog: boolean) => void
  classes
}

const FeatureGroupListing = (props: IProps) => {
  const {
    getFeatureGroupsFunc,
    handleModalClose,
    flow,
    featureGroups,
    featureGroupTableDetails,
    handleShowDialog,
    classes
  } = props

  const [pageNumber, setPageNumber] = useState<number>(0)

  const [searchQuery, setSearchQuery] = useState<string>('')

  const [groupIdSelection, setGroupIdSelection] = useState<string>(null)

  const columnConfig = featureGroupsListingColumnConfig()

  const isEditFlow = flow === Flow.Edit && featureGroupTableDetails

  useEffect(() => {
    getFeatureGroupsFunc(
      {
        filters: [],
        offset: pageNumber * 10,
        pageSize: 10,
        searchString: isEditFlow
          ? featureGroupTableDetails.featureGroupData.featureGroupName
          : searchQuery,
        sortBy: 'name',
        sortOrder: 'asc',
        type: 'online'
      },
      [...(featureGroups.data || [])]
    )
  }, [pageNumber, searchQuery])

  useEffect(() => {
    if (
      isEditFlow &&
      featureGroups.status === API_STATUS.SUCCESS &&
      featureGroups.data
    ) {
      const selectedFeatureGroup = featureGroups.data.find(
        (item) =>
          item.title ===
          featureGroupTableDetails.featureGroupData.featureGroupName
      )
      if (selectedFeatureGroup) {
        setGroupIdSelection(selectedFeatureGroup.title)
      }
    }
  }, [featureGroups])

  const totalRows = featureGroups?.totalRecordsCount

  const pageChangeHandler = (page: number) => {
    if (page - 1 === pageNumber) {
      return
    }
    setPageNumber(page - 1)
  }

  const onSearchInput = (str: string) => {
    setSearchQuery(str)
  }

  const eventRowClickHandler = (event: any) => {
    setGroupIdSelection(event.id)
  }

  return (
    <>
      {!groupIdSelection && (
        <div className={classes.container}>
          <div className={classes.closeDiv}>
            <Close
              style={{marginRight: 18, cursor: 'pointer'}}
              onClick={() => handleModalClose(false)}
            />
            <span style={{fontWeight: 700, fontSize: 16}}>
              Add Feature Table
            </span>
          </div>
          <div className={classes.leftSearchFilter}>
            <SearchBar
              placeholder='Search By Feature Group Name'
              value={searchQuery}
              onValueChange={onSearchInput}
            />
          </div>
          <div>
            <div className={classes.dataList}>
              <Datatable<any>
                enablePagination={totalRows ? true : false}
                enableSelection={false}
                singleSelection={false}
                size={TableCellSize.Medium}
                columnConfig={columnConfig}
                data={featureGroups.data || []}
                indexKeyName={'id'}
                onSelectAllClick={() => {}}
                enableSelectionColumn={false}
                loading={featureGroups.status === 3}
                totalRow={totalRows}
                pageHandler={(page) => pageChangeHandler(page)}
                page={pageNumber + 1}
                onRowClick={
                  !(featureGroups.status === 3)
                    ? eventRowClickHandler
                    : undefined
                }
              />
            </div>
            {totalRows > 0 ||
            featureGroups.status === API_STATUS.LOADING ? null : (
              <NoResultsFound />
            )}
          </div>
        </div>
      )}
      {groupIdSelection && (
        <FeatureGroupSelection
          flow={flow}
          groupIdSelection={groupIdSelection}
          onBackPress={() =>
            isEditFlow ? handleShowDialog(false) : setGroupIdSelection(null)
          }
          closeModal={() => handleModalClose(false)}
          featureGroupTableDetails={featureGroupTableDetails}
        />
      )}
    </>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroups: state.edgeModelsReducer.featureGroups
})

const mapDispatchToProps = (dispatch) => {
  return {
    getFeatureGroupsFunc: (
      payload: GetFeatureGroupsInput,
      preLoadedData: GetFeatureGroups['getFeatureGroups']['data']
    ) => getFeatureGroups(dispatch, payload, preLoadedData)
  }
}

const StyleComponent = compose<any>(
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps, mapDispatchToProps)
)(FeatureGroupListing)

export default StyleComponent
