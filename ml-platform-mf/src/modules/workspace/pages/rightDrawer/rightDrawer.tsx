import {IconButton} from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import config from 'config'
import * as React from 'react'
import {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {ToolTipPlacement} from '../../../../bit-components/tooltip/index'
import Info from '../../../../components/Info'
import {predefinedToolTips} from '../../../../components/Info/constants'
import ImportDataBaseListing from '../../../../components/workspace/importDataBaseListing'
import ImportDataDetails from '../../../../components/workspace/importDataDetails/importDataDetails'
import ImportDataListing from '../../../../components/workspace/importDataListing/importDataListing'
import AttachedClusterDetails from '../../../../layouts/attachedClusterDetails/attachedClusterDetails'
import {CLUSTER_STATUS} from '../../../../layouts/attachedClusterDetails/constant'
import AttachedClusterView from '../../../../layouts/attachedClusterView/attachedClusterView'
import {API_STATUS} from '../../../../utils/apiUtils'
import {setDatabaseForEnvironmentAndSource, setSideBarConfig} from '../actions'
import {SelectionOnAttachedCluster} from '../graphqlApis/createCodespace/createCodespace'
import {GetClusterResources} from '../graphqlApis/getClusterResources/getClusterResources'
import {SelectionOnTables} from '../graphqlApis/getDataForEnvironmentAndSource'
import {SelectionOnData} from '../graphqlApis/getLastSelectedCodespace/getLastSelectedCodespace'
import {ISideBarConfig} from '../reducer'
import {RightMenuItems, SideBarWidth} from './constants'
import {useStyles} from './rightDrawerJSS'

interface IProps {
  selectedCodespace: {
    data: SelectionOnData
  }
  attachedCluster: SelectionOnAttachedCluster
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
  sideBarConfigData: ISideBarConfig
  clusterResources: {
    status: API_STATUS
    data: GetClusterResources['getClusterResources']['data']
    error: any
  }
  resetDatabasesForEnvironmentAndSource: () => void
  fullScreenJupyter: boolean
}

function RightDrawer(props: IProps) {
  const {
    selectedCodespace,
    setSideBarConfigFunc,
    sideBarConfigData,
    attachedCluster,
    clusterResources,
    resetDatabasesForEnvironmentAndSource,
    fullScreenJupyter
  } = props
  const [searchByValue, setSearchByValue] = useState('')
  const [environmentValue, setEnvironmentValue] = useState(null)
  const [selectedSource, setSelectedSource] = useState(null)
  const [selectedDataSource, setSelectedDataSource] =
    useState<SelectionOnTables>(null)
  const [selectedDatabase, setSelectedDatabase] = useState(null)
  const classes = useStyles({currentWidth: sideBarConfigData.width})

  const onSelectDataSource = (dataSourceName: SelectionOnTables) => {
    setSelectedDataSource(dataSourceName)
  }

  const getClusterIcon = () => {
    if (!attachedCluster) {
      return '/icons/cluster.svg'
    } else if (attachedCluster.cluster_status === CLUSTER_STATUS.active) {
      return '/icons/cluster-tick.svg'
    } else if (attachedCluster.cluster_status === CLUSTER_STATUS.inactive) {
      return '/icons/darwin-workspace-inactive-cluster.svg'
    }

    return '/icons/cluster.svg'
  }

  useEffect(() => {
    return () => {
      setSideBarConfigFunc({
        isOpen: false,
        selectedMenu: null,
        width: SideBarWidth.SmallWidth
      })
      resetDatabasesForEnvironmentAndSource()
    }
  }, [])

  return (
    <div
      className={`${classes.rightDrawer} ${
        sideBarConfigData.isOpen ? classes.openDrawer : classes.closeDrawer
      }`}
      style={{
        top: fullScreenJupyter ? 0 : '48px',
        height: fullScreenJupyter ? '100%' : 'calc(100% - 48px)'
      }}
    >
      <div className={classes.leftMenu}>
        <div>
          <IconButton
            onClick={() => {
              setSideBarConfigFunc({
                isOpen:
                  sideBarConfigData.selectedMenu === RightMenuItems.COMPUTE
                    ? !sideBarConfigData.isOpen
                    : true,
                selectedMenu: RightMenuItems.COMPUTE,
                width: SideBarWidth.SmallWidth
              })
            }}
          >
            <Info
              msg={
                !attachedCluster ? (
                  predefinedToolTips.attachCluster
                ) : attachedCluster.cluster_status === 'active' ? (
                  <predefinedToolTips.activeCluster
                    attachedCluster={attachedCluster}
                    clusterResources={clusterResources}
                  />
                ) : (
                  predefinedToolTips.activatingCluster
                )
              }
              placement={ToolTipPlacement.Left}
            >
              <div>
                <img
                  src={config.cfMsdAssetUrl + getClusterIcon()}
                  className={
                    sideBarConfigData.selectedMenu === RightMenuItems.COMPUTE &&
                    sideBarConfigData.isOpen
                      ? classes.selectedIcon
                      : classes.icon
                  }
                />
                {attachedCluster?.cluster_status ===
                  CLUSTER_STATUS.creating && (
                  <LinearProgress className={classes.creatingClusterLoader} />
                )}
              </div>
            </Info>
          </IconButton>
        </div>
        {/* <div>
          <IconButton
            onClick={() => {
              setSideBarConfigFunc({
                isOpen:
                  sideBarConfigData.selectedMenu ===
                    RightMenuItems.DATA_TABLE_LIST ||
                    sideBarConfigData.selectedMenu ===
                    RightMenuItems.DATABASE_TABLE_LIST ||
                    sideBarConfigData.selectedMenu ===
                    RightMenuItems.DATA_TABLE_DETAILS
                    ? !sideBarConfigData.isOpen
                    : true,
                selectedMenu: RightMenuItems.DATABASE_TABLE_LIST,
                width: SideBarWidth.LargeWidth
              })
            }}
          >
            <img
              src={config.cfMsdAssetUrl + '/icons/datasets.svg'}
              className={
                (sideBarConfigData.selectedMenu ===
                  RightMenuItems.DATA_TABLE_DETAILS ||
                  sideBarConfigData.selectedMenu ===
                  RightMenuItems.DATA_TABLE_LIST ||
                  sideBarConfigData.selectedMenu ===
                  RightMenuItems.DATABASE_TABLE_LIST) &&
                  sideBarConfigData.isOpen
                  ? classes.selectedIcon
                  : classes.icon
              }
            />
          </IconButton>
        </div> */}
      </div>
      <div className={classes.rightMenu}>
        {sideBarConfigData.selectedMenu === RightMenuItems.COMPUTE ? (
          attachedCluster ? (
            <AttachedClusterDetails />
          ) : (
            <AttachedClusterView />
          )
        ) : null}
        {/* {sideBarConfigData.selectedMenu === RightMenuItems.DATA_TABLE_LIST ? (
          <ImportDataListing
            searchByValue={searchByValue}
            setSearchByValue={setSearchByValue}
            environmentValue={environmentValue}
            setEnvironmentValue={setEnvironmentValue}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            onSelectDataSource={onSelectDataSource}
            selectedDatabase={selectedDatabase}
          />
        ) : null}
        {sideBarConfigData.selectedMenu ===
        RightMenuItems.DATABASE_TABLE_LIST ? (
          <ImportDataBaseListing
            searchByValue={searchByValue}
            setSearchByValue={setSearchByValue}
            environmentValue={environmentValue}
            setEnvironmentValue={setEnvironmentValue}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            onSelectDatabase={setSelectedDatabase}
          />
        ) : null}
        {sideBarConfigData.selectedMenu ===
        RightMenuItems.DATA_TABLE_DETAILS ? (
          <ImportDataDetails
            environment={environmentValue}
            source={selectedSource}
            dataSource={selectedDataSource}
            selectedDatabase={selectedDatabase}
          />
        ) : null} */}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  selectedCodespace: state['workspaceProjectReducer']['selectedCodespace'],
  sideBarConfigData: state['workspaceProjectReducer']['sideBarConfig'],
  attachedCluster: state['workspaceProjectReducer']['attachedCluster'],
  clusterResources: state.workspaceProjectReducer.clusterResources
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload)),
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

const styleComponent = compose(connect(mapStateToProps, mapDispatchToProps))(
  RightDrawer
)

export default styleComponent
