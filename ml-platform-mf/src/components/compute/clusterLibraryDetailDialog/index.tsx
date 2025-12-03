import {CircularProgress} from '@material-ui/core'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Dialog} from '../../../bit-components/dialog/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {LibraryFileType} from '../../../gql-enums/library-file-type.enum'
import {LibrarySource} from '../../../gql-enums/library-source.enum'
import {LibraryStatus} from '../../../gql-enums/library-status.enum'
import {CLUSTER_LIBRARY_STATUS} from '../../../modules/compute/pages/constant'
import {GetComputeLibraryDetailsInput} from '../../../modules/compute/pages/graphqlApis/getComputeLibraryDetails'
import {getComputeLibraryDetails} from '../../../modules/compute/pages/graphqlApis/getComputeLibraryDetails/index.thunk'
import {IComputeLibraryDetails} from '../../../modules/compute/pages/graphqlApis/reducer'
import CircleLoader from '../../../modules/login/circleLoader'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  handleDialogClose: () => void
  openDialog: boolean
  clusterId: string
  libraryId: number
  getComputeLibraryDetails: (payload: GetComputeLibraryDetailsInput) => void
  computeLibraryDetails: IComputeLibraryDetails
}

const ClusterLibraryDetailDialog = (props: IProps) => {
  const {
    classes,
    handleDialogClose,
    clusterId,
    libraryId,
    openDialog,
    computeLibraryDetails,
    getComputeLibraryDetails
  } = props

  const libraryDetailsData = computeLibraryDetails?.data?.data

  useEffect(() => {
    const variables: GetComputeLibraryDetailsInput = {
      cluster_id: clusterId,
      library_id: libraryId
    }
    getComputeLibraryDetails(variables)
  }, [libraryId])

  return (
    <Dialog
      open={openDialog}
      title={
        computeLibraryDetails?.status === API_STATUS.SUCCESS &&
        libraryDetailsData
          ? libraryDetailsData.version
            ? `${libraryDetailsData.name} (${libraryDetailsData.version})`
            : libraryDetailsData.name
          : ''
      }
      handleClose={handleDialogClose}
      dialogContent={
        <div className={classes.dialogContainer}>
          {computeLibraryDetails?.status === API_STATUS.LOADING ? (
            <div className={classes.loaderContainer}>
              <CircularProgress size={LoaderSize.Large} />
            </div>
          ) : (
            <>
              <div className={classes.libraryDetails}>
                <span className={classes.textDetails}>Status: </span>
                {libraryDetailsData?.status ? (
                  <div
                    className={`${classes.statusText} ${classes.textDetails}
                      ${
                        libraryDetailsData.status === LibraryStatus.success
                          ? classes.successStatus
                          : libraryDetailsData.status === LibraryStatus.failed
                          ? classes.failedStatus
                          : classes.uninstallPendingStatus
                      }`}
                  >
                    {CLUSTER_LIBRARY_STATUS[libraryDetailsData.status]}{' '}
                  </div>
                ) : (
                  'N/A'
                )}
              </div>
              <div className={classes.libraryDetails}>
                <span className={classes.textDetails}>Source:</span>
                <span className={classes.textDetails}>
                  {libraryDetailsData ? libraryDetailsData.source : 'N/A'}
                </span>
              </div>
              {(libraryDetailsData?.source === LibrarySource.workspace ||
                libraryDetailsData?.source === LibrarySource.s3) && (
                <div className={classes.libraryDetails}>
                  <span className={classes.textDetails}>Path:</span>
                  <span className={classes.textDetails}>
                    {libraryDetailsData ? libraryDetailsData.path : 'N/A'}
                  </span>
                </div>
              )}
              {libraryDetailsData?.type === LibraryFileType.maven_jar &&
                libraryDetailsData?.source === LibrarySource.maven && (
                  <div>
                    <div className={classes.libraryDetails}>
                      <span className={classes.textDetails}>Version:</span>
                      <span className={classes.textDetails}>
                        {libraryDetailsData
                          ? libraryDetailsData.version
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              {libraryDetailsData?.type === LibraryFileType.txt && (
                <div className={classes.libraryDetails}>
                  <span className={classes.textDetails}>Content:</span>
                  <span className={classes.messageContainer}>
                    <pre>
                      {libraryDetailsData ? libraryDetailsData.content : 'N/A'}
                    </pre>
                  </span>
                </div>
              )}
              <div className={classes.libraryDetails}>
                <span className={classes.textDetails}>Messages:</span>
                {libraryDetailsData?.error ? (
                  <div className={classes.messageContainer}>
                    <div className={classes.errorDetailsContainer}>
                      <span className={classes.errorHeading}>Error Code:</span>
                      <span className={classes.errorDetails}>
                        {libraryDetailsData?.error?.error_code}
                      </span>
                    </div>
                    <div className={classes.errorDetailsContainer}>
                      <span className={classes.errorHeading}>
                        Error Message:
                      </span>
                      <span className={classes.errorDetails}>
                        {libraryDetailsData?.error?.error_message}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className={classes.textDetails}>-</span>
                )}
              </div>

              <div className={classes.closeButton}>
                <Button
                  buttonText={'close'}
                  onClick={handleDialogClose}
                  variant={ButtonVariants.TERTIARY}
                />
              </div>
            </>
          )}
        </div>
      }
    />
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    computeLibraryDetails: state.computeReducer.computeLibraryDetails
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeLibraryDetails: (payload: GetComputeLibraryDetailsInput) =>
      getComputeLibraryDetails(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClusterLibraryDetailDialog)

export default StyleComponent
