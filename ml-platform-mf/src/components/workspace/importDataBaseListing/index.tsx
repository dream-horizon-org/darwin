import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton
} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Search} from '../../../bit-components/search/index'
import {
  setDatabaseForEnvironmentAndSource,
  setSideBarConfig
} from '../../../modules/workspace/pages/actions'
import {
  GetDatabasesForEnvironmentAndSourceInput,
  SelectionOnDatabases
} from '../../../modules/workspace/pages/graphqlApis/getDatabasesForEnvironmentAndSource'
import {getDatabasesForEnvironmentAndSource} from '../../../modules/workspace/pages/graphqlApis/getDatabasesForEnvironmentAndSource/index.thunk'
import {getDataSourceEnvironments} from '../../../modules/workspace/pages/graphqlApis/getDataSourceEnvironments/getDataSourceEnvironments.thunk'
import {GetDataSourceSourcesForEnvironmentInput} from '../../../modules/workspace/pages/graphqlApis/getDataSourceSourcesForEnvironment/getDataSourceSourcesForEnvironment'
import {getDataSourceSourcesForEnvironment} from '../../../modules/workspace/pages/graphqlApis/getDataSourceSourcesForEnvironment/getDataSourceSourcesForEnvironment.thunk'
import {
  IDatabases,
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
import SpinnerBackdrop, {
  SpinnerDropTypes
} from '../../spinnerBackdrop/spinnerBackdrop'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
  getDataSourceEnvironments: () => void
  getDataSourceSourcesForEnvironment: (
    payload: GetDataSourceSourcesForEnvironmentInput
  ) => void
  getDatabasesForEnvironmentAndSource: (
    payload: GetDatabasesForEnvironmentAndSourceInput,
    preLoadedData: SelectionOnDatabases[]
  ) => void
  environments: IEnvironments
  sources: ISources
  dataSource: IDataSource
  searchByValue: string
  environmentValue: any
  setEnvironmentValue: React.Dispatch<any>
  selectedSource: any
  setSelectedSource: React.Dispatch<any>
  onSelectDatabase: (databaseId: string) => void
  databases: IDatabases
  resetDatabasesForEnvironmentAndSource: () => any
}

const isLinkEnabled = false

const ImportDataBaseListing = (props: IProps) => {
  const {
    classes,
    setSideBarConfigFunc,
    getDataSourceEnvironments,
    getDataSourceSourcesForEnvironment,
    getDatabasesForEnvironmentAndSource,
    environments,
    sources,
    dataSource,
    environmentValue,
    setEnvironmentValue,
    selectedSource,
    setSelectedSource,
    onSelectDatabase,
    databases,
    resetDatabasesForEnvironmentAndSource
  } = props

  const pageResultCount = 20
  const [searchByValue, setSearchByValue] = useState('')
  let displayedDataSources = databases.data || []
  const [lastElement, setLastElement] = React.useState(null)
  const [listPageNumber, setPageNumber] = React.useState(0)
  const lastPageNumber =
    Number(databases.totalRecordsCount / pageResultCount) - 1

  const getDatabasesForEnvironmentAndSourceDebounced = useMemo(
    () => debounce(getDatabasesForEnvironmentAndSource),
    []
  )

  const onSearch = (value) => {
    setPageNumber(0)
    setSearchByValue(value)
  }

  const openDatabaseLink = (link: string) => {}

  useEffect(() => {
    getDataSourceEnvironments()
  }, [])

  useEffect(() => {
    if (environmentValue) {
      getDataSourceSourcesForEnvironment({
        env: environmentValue.id
      })
    }
  }, [environmentValue])

  useEffect(() => {
    if (environmentValue && selectedSource && selectedSource.id !== 's3') {
      const data = {
        env: environmentValue.id,
        source: selectedSource.id,
        offset: listPageNumber * pageResultCount,
        pageSize: pageResultCount,
        query: searchByValue || ''
      }
      getDatabasesForEnvironmentAndSourceDebounced(
        data,
        listPageNumber === 0 ? [] : databases.data || []
      )
    }
  }, [environmentValue, selectedSource, listPageNumber, searchByValue])

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
    if (!environmentValue && environments?.data?.length > 0) {
      setEnvironmentValue({
        id: environments?.data[0],
        label: environments?.data[0],
        value: environments?.data[0]
      })
    }
  }, [environments])

  useEffect(() => {
    return () => {
      resetDatabasesForEnvironmentAndSource()
    }
  }, [])

  return (
    <div className={classes.container}>
      <SpinnerBackdrop
        show={
          databases.status !== API_STATUS.LOADING &&
          (environments.status === API_STATUS.INIT ||
            environments.status === API_STATUS.LOADING ||
            sources.status === API_STATUS.INIT ||
            sources.status === API_STATUS.LOADING ||
            dataSource.status === API_STATUS.LOADING)
        }
        type={SpinnerDropTypes.BASIC}
      />
      <div className={classes.header}>
        <div className={classes.headerIcon}>
          <IconButton
            onClick={() =>
              setSideBarConfigFunc({
                isOpen: false,
                selectedMenu: null,
                width: SideBarWidth.SmallWidth
              })
            }
            leadingIcon={Icons.ICON_CLOSE}
            actionableVariants={
              ActionableIconButtonVariants.ACTIONABLE_SECONDARY
            }
            size={IconButtonSizes.LARGE}
            actionable={true}
            disabled={false}
          />
        </div>
        <div className={classes.headerContent}>Import Data</div>
      </div>
      <div className={classes.mainContent}>
        <div className={classes.doubleInputWrapper}>
          <div className={classes.doubleInput}>
            <Dropdown
              fieldVariant='withOutline'
              menuLists={
                environments?.data?.map((env) => ({
                  id: env,
                  label: env,
                  value: env
                })) || []
              }
              label={'Environment'}
              onChange={(ev, val) => {
                setPageNumber(0)
                setEnvironmentValue(val)
                setSelectedSource(null)
              }}
              dropDownValue={environmentValue}
            />
          </div>
          <div className={classes.doubleInput}>
            <Dropdown
              menuLists={
                sources?.data?.map((source) => ({
                  id: source,
                  label: source,
                  value: source
                })) || []
              }
              label={'Source'}
              onChange={(ev, val) => {
                setPageNumber(0)
                setSelectedSource(val)
                if (val.id === 's3') {
                  setSideBarConfigFunc({
                    isOpen: true,
                    selectedMenu: RightMenuItems.DATA_TABLE_LIST,
                    width: SideBarWidth.LargeWidth
                  })
                  onSelectDatabase('all')
                  resetDatabasesForEnvironmentAndSource()
                }
              }}
              dropDownValue={
                selectedSource?.id === 's3' ? null : selectedSource
              }
            />
          </div>
        </div>
        {databases.status !== API_STATUS.INIT && (
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
              <div className={classes.tableHeader}>Databases</div>
              <div className={classes.tableContentWrapper}>
                {databases.status === API_STATUS.SUCCESS &&
                  displayedDataSources.length === 0 && (
                    <div className={classes.noRowsInTable}>
                      No Results Found
                    </div>
                  )}
                {databases.status === API_STATUS.ERROR && (
                  <div className={classes.noRowsInTable}>
                    Failed to load data!
                  </div>
                )}
                {displayedDataSources.map((item, idx) => {
                  return (
                    <>
                      <div
                        className={classes.tableContent}
                        onClick={() => {
                          setSideBarConfigFunc({
                            isOpen: true,
                            selectedMenu: RightMenuItems.DATA_TABLE_LIST,
                            width: SideBarWidth.LargeWidth
                          })
                          onSelectDatabase(item.database_id)
                        }}
                        id={item.database_id}
                      >
                        <div className={classes.tableData}>
                          <span className={'itemContent'}>{item.name}</span>
                          {isLinkEnabled && item.link && (
                            <span
                              onClick={() => openDatabaseLink(item.link)}
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
                        databases.status !== API_STATUS.LOADING && (
                          <div
                            ref={setLastElement}
                            className={classes.tableLoader}
                            id={'lastEl'}
                          >
                            <CircularProgress size={60} />
                          </div>
                        )}
                    </>
                  )
                })}
                {databases.status === API_STATUS.LOADING && (
                  <div className={classes.tableLoader}>
                    <CircularProgress size={60} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  environments: state.workspaceProjectReducer.environments,
  sources: state.workspaceProjectReducer.sources,
  dataSource: state.workspaceProjectReducer.dataSource,
  databases: state.workspaceProjectReducer.databases
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload)),
    getDataSourceEnvironments: () => getDataSourceEnvironments(dispatch),
    getDataSourceSourcesForEnvironment: (
      payload: GetDataSourceSourcesForEnvironmentInput
    ) => getDataSourceSourcesForEnvironment(dispatch, payload),
    getDatabasesForEnvironmentAndSource: (
      payload: GetDatabasesForEnvironmentAndSourceInput,
      preLoadedData: SelectionOnDatabases[]
    ) => getDatabasesForEnvironmentAndSource(dispatch, payload, preLoadedData),
    resetDatabasesForEnvironmentAndSource: () =>
      dispatch(
        setDatabaseForEnvironmentAndSource({
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
)(ImportDataBaseListing)

export default styleComponent
