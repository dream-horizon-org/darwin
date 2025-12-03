import {CircularProgress} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {
  setDataForEnvironmentAndSource,
  setSideBarConfig
} from '../../../modules/workspace/pages/actions'
import {
  GetDataForEnvironmentAndSourceInput,
  SelectionOnTables
} from '../../../modules/workspace/pages/graphqlApis/getDataForEnvironmentAndSource'
import {getDataForEnvironmentAndSource} from '../../../modules/workspace/pages/graphqlApis/getDataForEnvironmentAndSource/index.thunk'
import {
  IDataSource,
  IEnvironments,
  ISideBarConfig,
  ISources
} from '../../../modules/workspace/pages/reducer'
import {
  RightMenuItems,
  SideBarWidth
} from '../../../modules/workspace/pages/rightDrawer/constants'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import SearchBar from '../../searchBar'
import {dataSources} from './constants'
import styles from './importDataListingJSS'

interface IProps extends WithStyles<typeof styles> {
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
  getDataForEnvironmentAndSource: (
    payload: GetDataForEnvironmentAndSourceInput,
    preLoadedData: IDataSource['data']
  ) => void
  environments: IEnvironments
  sources: ISources
  dataSource: IDataSource
  environmentValue: any
  setEnvironmentValue: React.Dispatch<any>
  selectedSource: any
  setSelectedSource: React.Dispatch<any>
  onSelectDataSource: (dataSource: SelectionOnTables) => void
  selectedDatabase: string
  resetDataForEnvironmentAndSource: () => any
}

const ImportDataListing = (props: IProps) => {
  const {
    classes,
    setSideBarConfigFunc,
    getDataForEnvironmentAndSource,
    dataSource,
    environmentValue,
    selectedSource,
    onSelectDataSource,
    selectedDatabase,
    resetDataForEnvironmentAndSource
  } = props

  const pageResultCount = 20
  let displayedDataSources = dataSource?.data || []
  const [searchByValue, setSearchByValue] = React.useState('')
  const [listPageNumber, setPageNumber] = React.useState(0)
  const [lastElement, setLastElement] = React.useState(null)
  const lastPageNumber =
    Number(dataSource.totalRecordsCount / pageResultCount) - 1
  const getDataForEnvironmentAndSourceDebounced = useMemo(
    () => debounce(getDataForEnvironmentAndSource),
    []
  )

  const onSearch = (value) => {
    setPageNumber(0)
    setSearchByValue(value)
  }

  useEffect(() => {
    if (environmentValue && selectedSource && selectedDatabase) {
      const data = {
        env: environmentValue.id,
        source: selectedSource.id,
        offset: listPageNumber * pageResultCount,
        pageSize: pageResultCount,
        query: searchByValue || '',
        database: selectedDatabase
      }
      getDataForEnvironmentAndSourceDebounced(
        data,
        listPageNumber === 0 ? [] : dataSource.data || []
      )
    }
  }, [
    selectedDatabase,
    environmentValue,
    selectedSource,
    searchByValue,
    listPageNumber
  ])

  const observer = React.useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        setPageNumber((no) => no + 1)
      }
    })
  )

  useEffect(() => {
    const currentElement = lastElement
    const currentObserver = observer.current

    if (currentElement) {
      currentObserver.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement)
      }
    }
  }, [lastElement])

  useEffect(() => {
    return () => {
      resetDataForEnvironmentAndSource()
    }
  }, [])

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.headerIcon}>
          <IconButton
            onClick={() =>
              setSideBarConfigFunc({
                isOpen: true,
                selectedMenu: RightMenuItems.DATABASE_TABLE_LIST,
                width: SideBarWidth.LargeWidth
              })
            }
            leadingIcon={Icons.ICON_ARROW_BACK}
            actionableVariants={
              ActionableIconButtonVariants.ACTIONABLE_SECONDARY
            }
            size={IconButtonSizes.LARGE}
            actionable={true}
            disabled={false}
          />
        </div>
        <div className={classes.headerContent}>
          <div className={classes.headerTitle}>
            {selectedSource?.id === 's3' ? 'Import Data' : selectedDatabase}
          </div>
          <div
            className={classes.headerSubTitle}
          >{`${selectedSource?.id}`}</div>
        </div>
      </div>
      <div className={classes.mainContent}>
        <>
          <div className={classes.singleInputWrapper}>
            <div className={classes.singleInput}>
              <SearchBar
                placeholder={''}
                value={searchByValue}
                onValueChange={onSearch}
              />
            </div>
          </div>
          <div className={classes.tableWrapper}>
            <div className={classes.tableHeader}>
              {dataSources[selectedSource]?.tableHeader || 'Table Name'}
            </div>
            <div className={classes.tableContentWrapper}>
              {dataSource.status === API_STATUS.LOADING &&
                displayedDataSources.length === 0 && (
                  <div className={classes.noRowsInTable}>
                    <CircularProgress size={60} />
                  </div>
                )}
              {dataSource.status === API_STATUS.SUCCESS &&
                displayedDataSources.length === 0 && (
                  <div className={classes.noRowsInTable}>
                    'No Results Found'
                  </div>
                )}
              {dataSource.status === API_STATUS.ERROR && (
                <div className={classes.noRowsInTable}>
                  Failed to load data!
                </div>
              )}
              {displayedDataSources.map((item, idx) => (
                <>
                  <div
                    className={classes.tableContent}
                    onClick={() => {
                      setSideBarConfigFunc({
                        isOpen: true,
                        selectedMenu: RightMenuItems.DATA_TABLE_DETAILS,
                        width: SideBarWidth.LargeWidth
                      })
                      onSelectDataSource(item)
                    }}
                    id={item.name}
                  >
                    <div className={classes.tableData}>
                      <span className={'itemContent'}>
                        {item.dc_name || item.name}
                      </span>
                      {selectedSource === dataSources.featureStore.id && (
                        <span
                          className={`${Icons.ICON_OPEN_IN_NEW} itemIcon`}
                        />
                      )}
                    </div>

                    <div className={classes.tableAction}>
                      <span
                        className={`${Icons.ICON_KEYBOARD_ARROW_RIGHT} itemIcon`}
                      />
                    </div>
                  </div>

                  {idx === (displayedDataSources || []).length - 1 &&
                    listPageNumber < lastPageNumber &&
                    dataSource.status !== API_STATUS.LOADING && (
                      <div
                        ref={setLastElement}
                        className={classes.tableLoader}
                        id={'lastEl'}
                      ></div>
                    )}
                  {idx === (displayedDataSources || []).length - 1 &&
                    displayedDataSources.length > 0 &&
                    dataSource.status === API_STATUS.LOADING && (
                      <div className={classes.tableLoader}>
                        <CircularProgress size={60} />
                      </div>
                    )}
                </>
              ))}
            </div>
          </div>
        </>
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  environments: state.workspaceProjectReducer.environments,
  sources: state.workspaceProjectReducer.sources,
  dataSource: state.workspaceProjectReducer.dataSource
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload)),
    getDataForEnvironmentAndSource: (
      payload: GetDataForEnvironmentAndSourceInput,
      preLoadedData: IDataSource['data']
    ) => getDataForEnvironmentAndSource(dispatch, payload, preLoadedData),
    resetDataForEnvironmentAndSource: () =>
      dispatch(
        setDataForEnvironmentAndSource({
          status: API_STATUS.INIT,
          data: null,
          error: null,
          totalRecordsCount: null
        })
      )
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ImportDataListing)

export default styleComponent
