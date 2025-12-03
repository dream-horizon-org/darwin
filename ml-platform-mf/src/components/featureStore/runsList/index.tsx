import {Tooltip} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import {format} from 'date-fns'
import React, {useEffect, useState} from 'react'
import {Icons} from '../../../bit-components/icon/index'

import {connect} from 'react-redux'
import {compose} from 'redux'
import {EmptyState} from '../../../bit-components/empty-state/index'
import {ApiStatus} from '../../../gql-enums/api-status.enum'
import {GetFeatureGroupRunsInput} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupRuns'
import {getFeatureGroupRuns} from '../../../modules/featureStoreV2/graphqlAPIs/getFeatureGroupRuns/index.thunk'
import {IFeatureGroupDetailsState} from '../../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {
  getInternationalNumberFormat,
  getTimeDifference,
  truncate
} from '../../../utils/helper'
import Spinner from '../../spinner/spinner'
import styles from './indexJSS'
import OtherFactorDisplayField from './otherFactorDisplayField'
import TextDisplayField from './textDisplayField'

interface IProps extends WithStyles<typeof styles> {
  featureGroupRuns: IFeatureGroupDetailsState['featureGroupRuns']
  featureGroupDetails: IFeatureGroupDetailsState['featureGroupDetails']
  getFeatureGroupRunsFunc: (data: GetFeatureGroupRunsInput) => void
}

const RunsList = (props: IProps) => {
  const {
    classes,
    featureGroupRuns,
    featureGroupDetails,
    getFeatureGroupRunsFunc
  } = props

  const [selectedRun, setSelectedRun] = useState(0)

  const tableData = featureGroupRuns.data || []

  useEffect(() => {
    if (featureGroupDetails.data?.id) {
      getFeatureGroupRunsFunc({
        fg_name: featureGroupDetails.data.id,
        version: featureGroupDetails.data.version
      })
    }
  }, [featureGroupDetails])

  const maxSampleRowDataLength =
    featureGroupRuns.status === API_STATUS.SUCCESS && tableData.length > 0
      ? tableData[selectedRun].features.reduce((prev, f) => {
          if (prev < f.sampleData.length) {
            prev = f.sampleData.length
          }
          return prev
        }, 0)
      : 0

  return (
    <div className={classes.container}>
      {featureGroupRuns.status === API_STATUS.LOADING ? (
        <Spinner show={true} size={50} />
      ) : null}
      {featureGroupRuns.status === API_STATUS.ERROR ||
      (featureGroupRuns.status === API_STATUS.SUCCESS &&
        tableData.length === 0) ? (
        <div className={classes.placeholder}>
          <EmptyState
            imageUrl={`${config.cfMsdAssetUrl}/images/darwin-no-runs-available.gif`}
            subTitle='No Runs Found !'
            imageSizes={{width: '232px', height: '232px'}}
          />
        </div>
      ) : null}
      {featureGroupRuns.status === API_STATUS.SUCCESS && tableData.length > 0 && (
        <div className={classes.runsListContainer}>
          {tableData.map((run, runIdx) => (
            <div
              key={runIdx}
              className={`${classes.runContainer} ${
                selectedRun === runIdx && 'selected'
              }`}
              onClick={() => setSelectedRun(runIdx)}
            >
              <div className={classes.runsStatus}>
                <span
                  className={
                    run.status === ApiStatus.SUCCESS
                      ? `${Icons.ICON_CHECK_CIRCLE} ${classes.success}`
                      : `${Icons.ICON_REPORT_GMAILERRORRED} ${classes.failure}`
                  }
                />
              </div>
              <div className={classes.runData}>
                <div className={classes.runTitle}>
                  {run.executionTime
                    ? format(
                        new Date(Number(run.executionTime) * 1000),
                        'MMM d, yyyy, hh:mm a'
                      )
                    : '-'}
                </div>
                <div className={classes.runDuration}>
                  Duration:{' '}
                  {run.duration ? getTimeDifference(run.duration) : 'NA'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {featureGroupRuns.status === API_STATUS.SUCCESS && tableData.length > 0 && (
        <div className={classes.tableContainer}>
          {tableData[selectedRun].status === ApiStatus.SUCCESS ? (
            <>
              <div className={classes.tableWrapper}>
                {tableData[selectedRun].features.map((f) => {
                  return (
                    <div key={f.title} className={classes.tableColumns}>
                      <TextDisplayField
                        value={f.title}
                        className={classes.fTitle}
                      />
                      <div className={classes.fMeanBody}>
                        {f.otherFactors.map((fFactors) => (
                          <OtherFactorDisplayField
                            className={classes.otherfactorWrapper}
                            key={fFactors.name}
                            name={fFactors.name}
                            value={fFactors.value || '-'}
                          />
                        ))}
                      </div>
                      {[
                        ...f.sampleData,
                        ...new Array(
                          maxSampleRowDataLength - f.sampleData.length
                        ).fill('-')
                      ].map((fData, fIdx) => {
                        return (
                          <TextDisplayField
                            key={`${fData}-${fIdx}`}
                            value={fData}
                            className={classes.fData}
                          />
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              <div className={classes.fFooter}>
                <span>
                  ** Descriptive statistics are computed on the above sample set
                  for now
                </span>
                <span>
                  Total Rows:{' '}
                  {getInternationalNumberFormat(
                    tableData[selectedRun].totalRecordsCount
                  ) || 0}
                </span>
              </div>
            </>
          ) : (
            <div className={classes.tableError}>
              <div className={classes.tableErrorIcon}>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/failed_runs_cat.png`}
                  alt='Failed Run'
                />
              </div>
              <Tooltip title={tableData[selectedRun].message || ''}>
                <div className={classes.tableErrorText}>
                  Oops! This run failed, something went wrong!
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  featureGroupDetails: state.featureGroupDetailsReducer.featureGroupDetails,
  featureGroupRuns: state.featureGroupDetailsReducer.featureGroupRuns
})

const mapDispatchToProps = (dispatch) => {
  return {
    getFeatureGroupRunsFunc: (data: GetFeatureGroupRunsInput) =>
      getFeatureGroupRuns(dispatch, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(RunsList)

export default StyleComponent
