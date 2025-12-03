import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {setSideBarConfig} from '../../../modules/workspace/pages/actions'
import {SelectionOnTables} from '../../../modules/workspace/pages/graphqlApis/getDataForEnvironmentAndSource'
import {GetSampleDataForDataSourceInput} from '../../../modules/workspace/pages/graphqlApis/getSampleDataForDataSource/getSampleDataForDataSource'
import {getSampleDataForDataSource} from '../../../modules/workspace/pages/graphqlApis/getSampleDataForDataSource/getSampleDataForDataSource.thunk'
import {
  ISampleDataForDataSource,
  ISideBarConfig
} from '../../../modules/workspace/pages/reducer'
import {
  RightMenuItems,
  SideBarWidth
} from '../../../modules/workspace/pages/rightDrawer/constants'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import BackButton from '../../backButton/backButton'
import CopyCodeButton from '../../copyCodeButton/copyCodeButton'
import SpinnerBackdrop, {
  SpinnerDropTypes
} from '../../spinnerBackdrop/spinnerBackdrop'
import {dataSources} from '../importDataListing/constants'
import styles from './importDataDetailJSS'

interface IProps extends WithStyles<typeof styles> {
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
  getSampleDataForDataSource: (payload: GetSampleDataForDataSourceInput) => void
  dataSource: SelectionOnTables
  environment: any
  source: any
  sampleDataForDataSource: ISampleDataForDataSource
  selectedDatabase: string
}

const versionList = [{label: 'V2', id: 1, value: 'v2'}]

const ImportDataDetails = (props: IProps) => {
  const {
    classes,
    setSideBarConfigFunc,
    dataSource,
    environment,
    source,
    getSampleDataForDataSource,
    sampleDataForDataSource,
    selectedDatabase
  } = props

  useEffect(() => {
    if (dataSource && environment && source) {
      const data = {
        env: environment.id,
        source: source.id,
        dataSource: dataSource.name,
        version: null,
        offset: 10,
        pageSize: 0
      }
      getSampleDataForDataSource(data)
    }
  }, [dataSource, environment, source])

  const onClickBack = () => {
    setSideBarConfigFunc({
      isOpen: true,
      selectedMenu: RightMenuItems.DATA_TABLE_LIST,
      width: SideBarWidth.LargeWidth
    })
  }

  return (
    <div className={classes.container}>
      <SpinnerBackdrop
        show={
          sampleDataForDataSource.status === API_STATUS.INIT ||
          sampleDataForDataSource.status === API_STATUS.LOADING
        }
        type={SpinnerDropTypes.BASIC}
      />
      <div className={classes.header}>
        <div className={classes.headerIcon}>
          <BackButton mode='action' onClick={onClickBack} />
        </div>
        <div className={classes.headerContent}>
          <div className={classes.headerTitle}>{dataSource.dc_name}</div>
          <div className={classes.headerSubTitle}>
            {source.id === 's3'
              ? `${source.id}`
              : `${source.id} / ${selectedDatabase}`}
          </div>
        </div>
        {source === dataSources.featureStore.id && (
          <div className={classes.headerVersions}>
            <Dropdown
              onBlur={() => {}}
              menuLists={versionList}
              label={'Version'}
              onChange={(ev, val) => {}}
              dropDownValue={versionList[0]}
              error={Boolean('')}
              assistiveText={Boolean('') && ''}
              fieldVariant='withOutline'
            />
          </div>
        )}
        {sampleDataForDataSource?.data?.sample_data?.length > 0 &&
          sampleDataForDataSource?.data?.copy_code_command && (
            <div className={classes.copyButtonWrapper}>
              <CopyCodeButton
                copyCodes={sampleDataForDataSource.data.copy_code_command || []}
              />
            </div>
          )}
      </div>
      <div className={classes.mainContent}>
        {sampleDataForDataSource?.data?.sample_data?.length > 0 && (
          <div className={classes.sampleTable}>
            <div className={classes.tableHead}>
              <div className={classes.headColumn1}>Column Name</div>
              <div className={classes.headColumn2}>Type</div>
              <div className={classes.headColumn3}>Sample Data</div>
            </div>
            <div className={classes.tableContent}>
              {sampleDataForDataSource?.data?.sample_data?.map((item, idx) => (
                <div key={idx} className={classes.tableRow}>
                  <div className={classes.contentColumn1}>
                    {item.column_name}
                  </div>
                  <div className={classes.contentColumn2}>{item.type}</div>
                  <div className={classes.contentColumn3}>
                    {item.sample_data}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {sampleDataForDataSource?.status === API_STATUS.SUCCESS &&
          sampleDataForDataSource?.data?.sample_data?.length === 0 && (
            <div className={classes.noDataFound}>No Data Found</div>
          )}
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  sampleDataForDataSource: state.workspaceProjectReducer.sampleDataForDataSource
})

const mapDispatchToProps = (dispatch) => {
  return {
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload)),
    getSampleDataForDataSource: (payload: GetSampleDataForDataSourceInput) =>
      getSampleDataForDataSource(dispatch, payload)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ImportDataDetails)

export default styleComponent
