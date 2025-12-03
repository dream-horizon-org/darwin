import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback, useEffect} from 'react'
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {setDialogConfig} from '../../../actions/commonActions'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {IClusterStatus} from '../../../modules/compute/pages/graphqlApis/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import debounce from '../../../utils/debounce'
import SearchBar from '../../searchBar'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  searchQuery: string
  clusterStatusState: IClusterStatus
  clusterStatus: string
  handleUninstallButtonClick: () => void
  selectedRows: string[]
  confirmationModalOpen: boolean
  setConfirmationModalOpen: (value: boolean) => void
  setDrawerOpen: (value: boolean) => void
}

const ClusterLibrariesHeader = (props: IProps) => {
  const {
    classes,
    setSearchQuery,
    searchQuery,
    clusterStatusState,
    clusterStatus,
    selectedRows,
    handleUninstallButtonClick,
    setConfirmationModalOpen,
    confirmationModalOpen,
    setDrawerOpen
  } = props

  const dispatch = useDispatch()
  const title = `Uninstall ${
    selectedRows.length === 0 ? '' : selectedRows.length
  } Library`
  const message =
    'Uninstalling the libraries will remove it completely. This can’t be undone. Are you sure you want to uninstall ?'
  const clusterCurrentStatus = clusterStatusState.data
    ? clusterStatusState.data.status
    : clusterStatus

  const debouncedSetSearchQuery = useCallback(
    debounce((value) => {
      setSearchQuery(value)
    }, 300),
    []
  )
  const handleClose = () => {
    setConfirmationModalOpen(false)
  }

  const handleUninstallDialogOpen = () => {
    setConfirmationModalOpen(true)
  }

  const handleInstallDialogOpen = () => {
    setDrawerOpen(true)
  }

  useEffect(() => {
    dispatch(
      setDialogConfig({
        title,
        message,
        open: confirmationModalOpen,
        onClose: handleClose,
        secondaryBtnText: 'Cancel',
        primaryBtnText: 'Uninstall',
        onPrimaryBtnClicked: handleUninstallButtonClick,
        onSecondaryBtnClicked: handleClose
      })
    )
  }, [confirmationModalOpen])

  useEffect(() => {
    debouncedSetSearchQuery(searchQuery)
  }, [searchQuery, debouncedSetSearchQuery])

  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <div className={classes.searchContainer}>
          <SearchBar
            placeholder={'Search a library'}
            value={searchQuery}
            onValueChange={(value: string) => {
              setSearchQuery(value)
            }}
          />
        </div>
      </div>
      <div className={classes.right}>
        <Button
          buttonText={'uninstall'}
          onClick={handleUninstallDialogOpen}
          leadingIcon={Icons.ICON_LINK_OFF}
          variant={ButtonVariants.SECONDARY}
          disabled={selectedRows.length === 0 ? true : false}
        />
        <Button
          buttonText={'install new'}
          onClick={handleInstallDialogOpen}
          leadingIcon={Icons.ICON_LINK}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    clusterStatusState: state.computeReducer.clusterStatus
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClusterLibrariesHeader)

export default StyleComponent
