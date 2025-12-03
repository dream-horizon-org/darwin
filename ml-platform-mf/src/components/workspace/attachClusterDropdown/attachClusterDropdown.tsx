import AddIcon from '@mui/icons-material/Add'
import {Autocomplete, Box, InputAdornment, TextField} from '@mui/material'
import {CircularProgress} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dialog} from '../../../bit-components/dialog/index'
import {Icons} from '../../../bit-components/icon/index'
import {
  TagsStatus,
  TagsStatusTypes
} from '../../../bit-components/tags/tags-status/index'
import {
  GetAllClustersInput,
  SelectionOnGetAllClusters
} from '../../../modules/workspace/pages/graphqlApis/getAllClusters/getAllClusters'
import {getAllClusters} from '../../../modules/workspace/pages/graphqlApis/getAllClusters/getAllClusters.thunk'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import Spinner from '../../spinner/spinner'
import styles, {inputStyles} from './attachClusterDropdownJSS'
import {clearPayload} from './constants'

interface IProps extends WithStyles<typeof styles> {
  getAllClusters: any
  getAllClustersList: {
    status: API_STATUS
    data: any
    error: any
    pageSize: number
    offset: number
    resultSize: number
    cancel?: () => void
  }
  setSelectedCluster?: (data: any) => void
  label?: string
}
export interface IClusterList {
  id: string
  name: string
  label: string
  core: number
  memory: number
  status: string
  link: string
}

const API_PAGE_SIZE = 10

const AttachClusterDropdown = (props: IProps) => {
  const {
    classes,
    getAllClusters,
    getAllClustersList,
    setSelectedCluster: setSelectedClusterParent = () => {},
    label
  } = props
  const [selectedCluster, setSelectedCluster] = useState<IClusterList | null>(
    null
  )
  const [activateDialogOpen, setActivateDialogOpen] = useState({
    open: false,
    cluster: null
  })
  const [lastElement, setLastElement] = useState(null)
  const [pageOffset, setPageOffset] = useState<number>(0)
  const [searchStr, setSearchStr] = useState<string>('')
  const [clusterOptions, setClusterOptions] = useState<[IClusterList]>()
  const [isScrolledToLast, setIsScrolledToLast] = useState<Boolean>(false)

  const getAllClustersSearchData = React.useMemo(
    () => debounce(getAllClusters, 1000),
    []
  )

  useEffect(() => {
    if (pageOffset === 0) return

    const payload = {
      searchString: searchStr,
      pageSize: API_PAGE_SIZE,
      offset: pageOffset
    }
    getAllClusters(
      payload,
      getAllClustersList?.data,
      getAllClustersList?.resultSize
    )
  }, [pageOffset])

  useEffect(() => {
    const payload = {
      searchString: searchStr,
      pageSize: API_PAGE_SIZE,
      offset: pageOffset
    }
    getAllClustersList.cancel && getAllClustersList.cancel()
    getAllClustersSearchData(payload, [], null)
  }, [searchStr])

  useEffect(() => {
    const getClusterOptions: [IClusterList] = (
      getAllClustersList.data || []
    ).map((cluster, idx) => ({
      id: cluster.id,
      name: cluster.name,
      label: cluster.name,
      core: cluster.cores,
      memory: cluster.memory,
      status: cluster.status,
      link: `/clusters/${cluster.id}/configuration/`
    }))
    setClusterOptions(getClusterOptions)
  }, [getAllClustersList])

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting) {
        setIsScrolledToLast(true)
      }
    })
  )

  useEffect(() => {
    if (
      isScrolledToLast &&
      getAllClustersList.status === API_STATUS.SUCCESS &&
      pageOffset < getAllClustersList.resultSize
    ) {
      setPageOffset((preVal: number) => preVal + API_PAGE_SIZE)
    }
    setIsScrolledToLast(false)
  }, [isScrolledToLast])

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

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStr(event?.target?.value)
    setPageOffset(0)
  }

  const clearAllCluster = () => {
    getAllClusters(clearPayload)
    setSearchStr('')
    setPageOffset(0)
  }

  const customFilterOptions = (options, {inputValue}) => {
    return options
  }

  const onPopupOpen = () => {
    setPageOffset(0)
    setSearchStr('')
    const payload = {
      searchString: '',
      pageSize: API_PAGE_SIZE,
      offset: 0
    }
    getAllClusters(payload, [], getAllClustersList?.resultSize)
  }

  return (
    <>
      <Dialog
        handleClose={() => {
          setSelectedCluster(null)
          setActivateDialogOpen({
            open: false,
            cluster: null
          })
          clearAllCluster()
        }}
        testIdentifier='attachDialog'
        title={'Inactive Cluster'}
        open={activateDialogOpen.open}
        dialogContent={
          <div>
            {
              'Selecting an inactive cluster will activate the cluster once you attach it. Are you sure you want to select this cluster ?'
            }
          </div>
        }
        dialogFooter={{
          primaryButton: {
            text: 'Yes',
            onClick: () => {
              setSelectedCluster(activateDialogOpen.cluster)
              setSelectedClusterParent(activateDialogOpen.cluster)
              setActivateDialogOpen({
                open: false,
                cluster: null
              })
            },
            testIdentifier: 'primaryButton'
          },
          secondaryButton: {
            text: 'Cancel',
            onClick: () => {
              setSelectedCluster(null)
              setActivateDialogOpen({
                open: false,
                cluster: null
              })
            },
            testIdentifier: 'secondaryButton'
          }
        }}
      />
      <div className={classes.container}>
        <Autocomplete
          onOpen={onPopupOpen}
          onChange={(ev, val: IClusterList) => {
            if (val && val.status !== 'active') {
              setActivateDialogOpen({
                open: true,
                cluster: val
              })
            } else {
              setSelectedCluster(val)
              setSelectedClusterParent(val)
            }
          }}
          value={selectedCluster}
          disablePortal={true}
          className={classes.customAutocomplete}
          id='country-select-demo'
          options={clusterOptions || []}
          autoHighlight
          getOptionLabel={(option: IClusterList) => {
            return option.name
          }}
          noOptionsText={
            <div className={classes.noOptionBox}>
              {getAllClustersList.status === API_STATUS.LOADING ? (
                <CircularProgress />
              ) : (
                getAllClustersList.status !== API_STATUS.ERROR &&
                'No Results Found'
              )}
              {getAllClustersList.status === API_STATUS.ERROR
                ? 'Failed to load!'
                : ''}
            </div>
          }
          ListboxProps={{role: 'list-box'}}
          renderOption={(props, option, state) => (
            <Box
              component='li'
              sx={{'& > img': {mr: 2, flexShrink: 0}}}
              {...props}
              ref={
                clusterOptions.indexOf(option) === clusterOptions.length - 1
                  ? setLastElement
                  : null
              }
              key={`${option?.id}`}
              style={{display: 'flex', flexDirection: 'column'}}
            >
              {option.name === 'action' ? (
                <div className={classes.createClusterWrapper}>
                  <span className={classes.openCreateClusterBtn}>
                    <AddIcon fontSize='small' />
                  </span>
                  <span className={classes.createClusterItem}>
                    Create Cluster
                  </span>
                  <span className={Icons.ICON_OPEN_IN_NEW}></span>
                </div>
              ) : (
                <div
                  className={`${classes.listItemWrapper} ${
                    selectedCluster && selectedCluster.name === option.name
                      ? 'active'
                      : ''
                  }`}
                >
                  <div className={classes.listItem1}>
                    <div className={classes.listItem11}>{option.name}</div>
                    <div className={classes.listItem12}>
                      {option.core || 0} Core/{option.memory || 0} GB
                    </div>
                  </div>
                  <div className={classes.listItem2}>
                    <TagsStatus
                      status={
                        option.status === 'active'
                          ? TagsStatusTypes.Active
                          : TagsStatusTypes.Paused
                      }
                    />
                  </div>
                  <div className={classes.listItem3}>
                    <span
                      onClick={(ev) => {
                        window.open(option.link, '_blank')
                        ev.stopPropagation()
                      }}
                      className={Icons.ICON_OPEN_IN_NEW}
                    />
                  </div>
                </div>
              )}
              {getAllClustersList.status === API_STATUS.LOADING &&
                clusterOptions.indexOf(option) ===
                  clusterOptions.length - 1 && (
                  <Box style={{marginBottom: 10}}>
                    <CircularProgress size={40} />
                  </Box>
                )}
            </Box>
          )}
          filterOptions={customFilterOptions}
          renderInput={(params) => {
            return (
              <div>
                <TextField
                  {...params}
                  sx={inputStyles}
                  className={classes.customTextField}
                  label={label || 'Attach Cluster (Optional)'}
                  value={searchStr}
                  onChange={changeHandler}
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'off' // disable autocomplete and autofill
                  }}
                  helperText={
                    selectedCluster ? (
                      <span className={'helperText'}>
                        <span>
                          {selectedCluster.core || 0} Core /{' '}
                          {selectedCluster.memory || 0} GB{' '}
                        </span>
                      </span>
                    ) : null
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {selectedCluster ? (
                          <InputAdornment
                            style={{paddingRight: '9px'}}
                            position='end'
                          >
                            {selectedCluster.status === 'active' ? (
                              <TagsStatus status={TagsStatusTypes.Active} />
                            ) : null}
                            {selectedCluster.status === 'inactive' ? (
                              <TagsStatus status={TagsStatusTypes.Paused} />
                            ) : null}
                          </InputAdornment>
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              </div>
            )
          }}
        />
      </div>
    </>
  )
}
const mapStateToProps = (state: CommonState) => ({
  getAllClustersList: state.workspaceProjectReducer.getAllClusters
})

const mapDispatchToProps = (dispatch) => {
  return {
    getAllClusters: (
      payload: GetAllClustersInput,
      preLoadedData: SelectionOnGetAllClusters['data'],
      resultSize: SelectionOnGetAllClusters['resultSize']
    ) => getAllClusters(dispatch, payload, preLoadedData, resultSize)
  }
}

const styleComponent = compose(
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps, mapDispatchToProps)
)(AttachClusterDropdown)

export default styleComponent
