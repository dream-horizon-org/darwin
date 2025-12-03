import {yupResolver} from '@hookform/resolvers/yup'
import {Drawer} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Control, Controller, useForm, useWatch} from 'react-hook-form'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Datatable} from '../../../bit-components/datatable/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Radio} from '../../../bit-components/radio/index'
import {TableCellSize} from '../../../bit-components/table-cells/tc-cell/index'
import {LibrarySource} from '../../../gql-enums/library-source.enum'
import {RepositoryType} from '../../../gql-enums/repository-type.enum'
import {
  GetMavenPackagesInput,
  SelectionOnGetMavenPackages
} from '../../../modules/compute/pages/graphqlApis/getMavenPackages'
import {getMavenPackages} from '../../../modules/compute/pages/graphqlApis/getMavenPackages/index.thunk'
import {GetMavenPackageVersionsInput} from '../../../modules/compute/pages/graphqlApis/getMavenPackageVersions'
import {getMavenPackageVersions} from '../../../modules/compute/pages/graphqlApis/getMavenPackageVersions/index.thunk'
import {InstallLibraryInput} from '../../../modules/compute/pages/graphqlApis/installLibrary'
import {
  IComputeInstallLibrary,
  IComputeMavenPackages,
  IComputeMavenPackageVersions,
  IComputeState
} from '../../../modules/compute/pages/graphqlApis/reducer'
import {computeInstallLibrarySchema} from '../../../modules/workflows/constants'
import {CommonState} from '../../../reducers/commonReducer'
import {
  IComputeLibraryFormData,
  MavenPackageData
} from '../../../types/compute/common.type'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import SearchBar from '../../searchBar'
import NoResultsFound from '../../workflows/noResultsFound'
import {
  libraryInstallConfig,
  mavenRepositoryConfig
} from '../computeBasicConfiguration/constant'
import {Data, getColumnConfig} from './columnConfig'
import styles from './indexJSS'
import MavenLibraries from './mavenLibraries'
import PypiPath from './pypiPath'
import S3Path from './s3Path'
import WorkspacePath from './workspacePath'

interface IProps extends WithStyles<typeof styles> {
  onClose: () => void
  open: boolean
  triggerInstallLibrary: (payload: InstallLibraryInput) => void
  getMavenPackages: (
    payload: GetMavenPackagesInput,
    prevData: SelectionOnGetMavenPackages
  ) => void
  getMavenPackageVersions: (payload: GetMavenPackageVersionsInput) => void
  mavenPackageVersions: IComputeMavenPackageVersions
  mavenPackages: IComputeState['computeMavenPackages']
  installLibrary: IComputeInstallLibrary
}

const ClusterInstallLibraryDrawer = (props: IProps) => {
  const {
    open,
    classes,
    onClose,
    getMavenPackages,
    mavenPackages,
    getMavenPackageVersions,
    mavenPackageVersions,
    triggerInstallLibrary,
    installLibrary
  } = props
  const {control, watch, trigger, setValue, handleSubmit, reset} =
    useForm<IComputeLibraryFormData>({
      resolver: yupResolver(computeInstallLibrarySchema),
      defaultValues: {
        librarySource: LibrarySource.pypi,
        workspacePath: '',
        Package: '',
        indexName: '',
        filePath: '',
        coordinates: '',
        repository: '',
        exclusions: '',
        mavenRepository: RepositoryType.CENTRAL
      },
      mode: 'onTouched'
    })
  const mavenPackagePageSize = 20
  const [mavenPackageOffset, setMavenPackageOffset] = useState(0)
  const selectedSource = useWatch({control, name: 'librarySource'})
  const selectedRepositoryType = useWatch({control, name: 'mavenRepository'})
  const [mavenSearchClicked, setMavenSearchClicked] = useState(false)
  const [selectedMavenPackageVersions, setSelectedMavenPackageVersions] =
    useState([{id: '', label: '', value: ''}])
  const [searchQuery, setSearchQuery] = useState('')
  const [groupId, setGroupId] = useState('')
  const [artifactId, setArtifactId] = useState('')
  const [pypiInfoVisible, setPypiInfoVisible] = useState(false)

  const handleReset = () => {
    reset({
      librarySource: selectedSource,
      workspacePath: '',
      Package: '',
      indexName: '',
      filePath: '',
      coordinates: '',
      repository: '',
      exclusions: '',
      mavenRepository: RepositoryType.CENTRAL
    })
  }

  const processPackageInput = (input: string) => {
    return input
      ?.split(',')
      .map((pkg) => pkg.trim())
      .map((pkg) => {
        const [name, version] = pkg.split('==').map((part) => part?.trim())
        return {name, version: version || null}
      })
  }

  const parseMavenCoordinates = (coordinates: string) => {
    const [groupId, artifactId, version] = coordinates?.split(':') || []
    return {
      name: groupId && artifactId ? `${groupId}:${artifactId}` : null,
      version: version || null
    }
  }

  const debouncedSetSearchQuery = useCallback(
    debounce((value) => {
      setSearchQuery(value)
    }, 300),
    []
  )
  useEffect(() => {
    debouncedSetSearchQuery(searchQuery)
  }, [searchQuery, debouncedSetSearchQuery])

  const getMavenPackagesDebounced = useMemo(
    () => debounce(getMavenPackages),
    []
  )
  useEffect(() => {
    setMavenPackageOffset(0)

    if (mavenPackages.cancel) {
      mavenPackages.cancel()
    }
    if (searchQuery) {
      const payload: GetMavenPackagesInput = {
        repository: selectedRepositoryType,
        search: searchQuery,
        offset: 0,
        page_size: mavenPackagePageSize
      }
      getMavenPackagesDebounced(payload, null)
    }
  }, [searchQuery])

  useEffect(() => {
    if (mavenPackageOffset === 0) return

    mavenPackages.cancel && mavenPackages.cancel()

    const payload: GetMavenPackagesInput = {
      repository: selectedRepositoryType,
      search: searchQuery,
      offset: mavenPackageOffset,
      page_size: mavenPackagePageSize
    }
    getMavenPackages(payload, mavenPackages?.data)
  }, [mavenPackageOffset])

  useEffect(() => {
    // setPypiInfoVisible(true)
    handleReset()
  }, [selectedSource])

  useEffect(() => {
    if (groupId && artifactId) {
      const payload: GetMavenPackageVersionsInput = {
        group_id: groupId,
        artifact_id: artifactId
      }
      getMavenPackageVersions(payload)
    }
  }, [groupId, artifactId])

  useEffect(() => {
    if (!open) {
      handleReset()
    }
  }, [open])

  useEffect(() => {
    if (mavenPackageVersions.status === API_STATUS.LOADING) {
      setSelectedMavenPackageVersions([
        {id: '', label: 'Loading...', value: ''}
      ])
    }
    const versionsData = mavenPackageVersions?.data?.data?.versions
    if (versionsData) {
      const versions = versionsData.map((version) => ({
        id: `${groupId}:${artifactId}:${version}`,
        label: version,
        value: version
      }))
      setSelectedMavenPackageVersions(versions)
    }
  }, [mavenPackageVersions])

  const searchPackageClicked = () => {
    setMavenSearchClicked(true)
  }

  const handleBackIconClicked = () => {
    setSearchQuery('')
    setMavenSearchClicked(false)
  }

  const handleCloseButton = () => {
    handleReset()
    setSearchQuery('')
    // setPypiInfoVisible(true)
    handleBackIconClicked()
    onClose()
  }

  const handleInstallClicked = handleSubmit((data: IComputeLibraryFormData) => {
    const payload: InstallLibraryInput = {
      clusterId: '',
      packages: []
    }

    switch (selectedSource) {
      case LibrarySource.pypi:
        const processedPackages = processPackageInput(data?.Package)
        processedPackages.forEach(({name, version}) => {
          payload.packages.push({
            source: LibrarySource.pypi,
            body: {
              name,
              version,
              path: data?.indexName || null,
              metadata: null
            }
          })
        })
        break
      case LibrarySource.s3:
        payload.packages.push({
          source: LibrarySource.s3,
          body: {
            name: null,
            path: data?.filePath,
            version: null,
            metadata: null
          }
        })
        break
      case LibrarySource.maven:
        const mavenCoordinates = parseMavenCoordinates(data?.coordinates)
        payload.packages.push({
          source: LibrarySource.maven,
          body: {
            name: mavenCoordinates.name,
            version: mavenCoordinates.version,
            path: null,
            metadata: {
              repository: LibrarySource.maven,
              exclusions: data?.exclusions || null
            }
          }
        })
        break
      case LibrarySource.workspace:
        payload.packages.push({
          source: LibrarySource.workspace,
          body: {
            name: null,
            path: data?.workspacePath,
            version: null,
            metadata: null
          }
        })
        break
      default:
        break
    }

    triggerInstallLibrary(payload)
  })

  const setSelectedMavenPackage = (value: string) => {
    setValue('coordinates', value)
    setValue('repository', selectedRepositoryType)
    handleBackIconClicked()
  }

  const getMavenPackageVersionsFunc = (data: MavenPackageData) => {
    setGroupId(data.group_id)
    setArtifactId(data.artifact_id)
  }

  const closePypiInfoBar = () => {
    // setPypiInfoVisible(false)
  }

  const columnConfig = getColumnConfig(
    classes,
    control,
    getMavenPackageVersionsFunc,
    selectedMavenPackageVersions,
    setSelectedMavenPackage
  )

  return (
    <Drawer
      anchor={'right'}
      open={open}
      className={classes.createDrawer}
      classes={{
        paper: classes.createDrawer
      }}
      onClose={handleCloseButton}
    >
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.headerIcon}>
            <IconButton
              onClick={
                !mavenSearchClicked ? handleCloseButton : handleBackIconClicked
              }
              leadingIcon={
                !mavenSearchClicked ? Icons.ICON_CLOSE : Icons.ICON_ARROW_BACK
              }
              actionableVariants={
                ActionableIconButtonVariants.ACTIONABLE_SECONDARY
              }
              size={IconButtonSizes.LARGE}
              actionable={true}
              disabled={false}
            />
          </div>
          <div className={classes.headerContent}>
            {!mavenSearchClicked ? 'Add Libraries' : 'Search Packages'}
          </div>
        </div>
        <div className={classes.contentContainer}>
          {!mavenSearchClicked ? (
            <>
              <div className={classes.sourceHeading}>Library Source</div>
              <div className={classes.radioButton}>
                {Object.values(libraryInstallConfig).map((config) => (
                  <Controller
                    key={config.text}
                    name='librarySource'
                    control={control}
                    render={({field: {value, onChange}}) => {
                      return (
                        <Radio
                          checked={value === config.value}
                          value={config.value}
                          text={config.text}
                          onChange={onChange}
                        />
                      )
                    }}
                  />
                ))}
              </div>
              {selectedSource === LibrarySource.workspace && (
                <WorkspacePath
                  control={control}
                  setValue={setValue}
                  trigger={trigger}
                />
              )}
              {selectedSource === LibrarySource.pypi && (
                <PypiPath
                  closePypiInfoBar={closePypiInfoBar}
                  control={control}
                  pypiInfoVisible={pypiInfoVisible}
                />
              )}
              {selectedSource === LibrarySource.s3 && (
                <S3Path control={control} />
              )}
              {selectedSource === LibrarySource.maven && (
                <MavenLibraries
                  control={control}
                  searchPackageClicked={searchPackageClicked}
                />
              )}
            </>
          ) : (
            <div>
              <div
                className={`${classes.radioButton} ${classes.mavenRepository}`}
              >
                {Object.values(mavenRepositoryConfig).map((config) => (
                  <Controller
                    key={config.text}
                    name='mavenRepository'
                    control={control}
                    render={({field: {value, onChange}}) => {
                      return (
                        <Radio
                          checked={value === config.value}
                          value={config.value}
                          text={config.text}
                          onChange={onChange}
                        />
                      )
                    }}
                  />
                ))}
              </div>
              <div className={classes.mavenSearchBar}>
                <SearchBar
                  placeholder={'Start typing here to see results...'}
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value)
                  }}
                />
              </div>
              {searchQuery === '' ? (
                <div className={classes.noResultsBox}>
                  <NoResultsFound
                    message={'Start writing a query to get results...'}
                  />
                </div>
              ) : (
                <div className={classes.datatable}>
                  <Datatable<Data>
                    enablePagination={false}
                    enableSelection={false}
                    singleSelection={false}
                    enableStickyHeader={true}
                    enableHeader={true}
                    size={TableCellSize.Large}
                    columnConfig={columnConfig}
                    data={
                      searchQuery ? mavenPackages?.data?.data?.packages : []
                    }
                    indexKeyName={'id'}
                    onRowClick={() => {}}
                    // loading={
                    //     mavenPackageOffset === 0 && mavenPackages?.status === API_STATUS.LOADING
                    // }
                    enableInfiniteScroll={true}
                    onScrollToPageEnd={() => {
                      if (mavenPackages?.status === API_STATUS.LOADING) return

                      if (
                        mavenPackageOffset + mavenPackagePageSize <=
                        (mavenPackages?.data?.data?.result_size || 0)
                      ) {
                        setMavenPackageOffset(
                          mavenPackageOffset + mavenPackagePageSize
                        )
                      }
                    }}
                    loadingNextPageItems={
                      mavenPackageOffset !== 0 &&
                      mavenPackages?.status === API_STATUS.LOADING
                    }
                    totalRow={mavenPackages?.data?.data?.result_size}
                  />
                  {mavenPackages?.status === API_STATUS.SUCCESS &&
                    mavenPackages?.data?.data?.result_size === 0 && (
                      <NoResultsFound />
                    )}
                </div>
              )}
            </div>
          )}
        </div>
        {!mavenSearchClicked && (
          <div className={classes.footer}>
            <Button
              buttonText={'install'}
              onClick={handleInstallClicked}
              variant={ButtonVariants.PRIMARY}
              disabled={installLibrary.status === API_STATUS.LOADING}
            />
            <Button
              buttonText={'cancel'}
              onClick={handleCloseButton}
              variant={ButtonVariants.TERTIARY}
            />
          </div>
        )}
      </div>
    </Drawer>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    mavenPackages: state.computeReducer.computeMavenPackages,
    mavenPackageVersions: state.computeReducer.computeMavenPackageVersions,
    installLibrary: state.computeReducer.computeInstallLibrary
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getMavenPackages: (
      payload: GetMavenPackagesInput,
      prevData: SelectionOnGetMavenPackages
    ) => getMavenPackages(dispatch, payload, prevData),
    getMavenPackageVersions: (payload, GetMavenPackageVersionsInputSchema) =>
      getMavenPackageVersions(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClusterInstallLibraryDrawer)

export default StyleComponent
