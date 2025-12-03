import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import {
  Autocomplete,
  AutocompleteRenderOptionState,
  Box,
  TextField
} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {UseFormSetValue} from 'react-hook-form'
import {connect} from 'react-redux'
import {useLocation} from 'react-router-dom'
import {compose} from 'redux'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Icons} from '../../../bit-components/icon/index'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {RuntimeClass} from '../../../gql-enums/runtime-class.enum'
import {RuntimeOptionIds} from '../../../modules/compute/pages/constant'
import {GetComputeRuntimeInput} from '../../../modules/compute/pages/graphqlApis/getComputeRuntime'
import {getComputeRuntime} from '../../../modules/compute/pages/graphqlApis/getComputeRuntime/index.thunk'
import {getComputeRuntimeDetails} from '../../../modules/compute/pages/graphqlApis/getComputeRuntimeDetails/index.thunk'
import {IComputeState} from '../../../modules/compute/pages/graphqlApis/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {
  IComputeFormData,
  IDropdownList
} from '../../../types/compute/common.type'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import styles, {inputStyles} from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  onChange: (value: IDropdownList<string>) => void
  dropDownValue: IDropdownList<string> | null
  error: string
  assistiveText: string
  onBlur: () => void
  disabled?: boolean
  getComputeRuntimeFunc: (
    payload: GetComputeRuntimeInput,
    prevData: any
  ) => void
  getComputeRuntimeDetailsFunc: (payload: {runtime: string}) => void
  computeRuntime: IComputeState['computeRuntime']
  computeRuntimeDetails: IComputeState['computeRuntimeDetails']
  setIsSparkEnabled: (isSparkEnabled: boolean) => void
  clusterId?: string
  setValue: UseFormSetValue<IComputeFormData>
}

const PAGE_SIZE = 3

const RuntimeDrop = (props: IProps) => {
  const {
    classes,
    onChange,
    dropDownValue,
    error,
    assistiveText,
    onBlur,
    disabled = false,
    getComputeRuntimeFunc,
    getComputeRuntimeDetailsFunc,
    computeRuntime,
    computeRuntimeDetails,
    setIsSparkEnabled,
    clusterId,
    setValue
  } = props

  const [selectedEnv, setSelectedEnv] = useState<RuntimeClass>(RuntimeClass.CPU)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  const getRuntimeLabelAndValue = (runtime) => {
    if (!runtime) return ''
    const components = Array.isArray(runtime.components)
      ? runtime.components
          .map((component) => `${component.name}: ${component.version}`)
          .join(', ')
      : ''
    return `${runtime.runtime} ${components}`
  }

  const defaultRuntime = useMemo(() => {
    return computeRuntime?.data?.[0]?.default_runtime || null
  }, [computeRuntime?.data])

  const defaultDropdownValue = useMemo(() => {
    return defaultRuntime
      ? {
          id: defaultRuntime.id,
          label: getRuntimeLabelAndValue(defaultRuntime),
          value: defaultRuntime.runtime,
          class: defaultRuntime.class,
          type: defaultRuntime.type,
          link: defaultRuntime.reference_link,
          count: 0
        }
      : null
  }, [defaultRuntime])

  useEffect(() => {
    if (
      !clusterId &&
      defaultDropdownValue &&
      !location.search.includes('clone') &&
      dropDownValue === undefined
    ) {
      onChange(defaultDropdownValue)
    }
  }, [defaultDropdownValue, dropDownValue])

  // Fetch runtime details when dropdown value changes
  useEffect(() => {
    if (dropDownValue) {
      getComputeRuntimeDetailsFunc({runtime: dropDownValue.value})
    }
  }, [dropDownValue])

  // Update selected environment class when runtime details are fetched
  useEffect(() => {
    if (
      computeRuntimeDetails.status === API_STATUS.SUCCESS &&
      computeRuntimeDetails?.data?.class
    ) {
      setSelectedEnv(computeRuntimeDetails.data.class as RuntimeClass)
      setIsSparkEnabled(
        computeRuntimeDetails?.data?.spark_connect ||
          computeRuntimeDetails?.data?.spark_auto_init ||
          false
      )

      // Only update if required fields are missing and values are different
      if (
        dropDownValue &&
        (!dropDownValue.class || !dropDownValue.type || !dropDownValue.link)
      ) {
        const runtimeClass = computeRuntimeDetails.data.class
        const runtimeType = computeRuntimeDetails.data.type
        const referenceLink = computeRuntimeDetails.data.reference_link
        const sparkEnabled =
          computeRuntimeDetails?.data?.spark_connect ||
          computeRuntimeDetails?.data?.spark_auto_init

        // Only update if values are different
        if (
          dropDownValue.class !== runtimeClass ||
          dropDownValue.type !== runtimeType ||
          dropDownValue.link !== referenceLink ||
          dropDownValue.spark_config !== sparkEnabled
        ) {
          const updatedDropdownValue = {
            ...dropDownValue,
            class: runtimeClass,
            type: runtimeType,
            link: referenceLink,
            count: 0,
            spark_config: sparkEnabled
          }
          setValue('runtime', updatedDropdownValue)
        }
      }
    }
  }, [computeRuntimeDetails])

  // Debounced search function
  const getComputeRuntimeDebounced = useMemo(
    () => debounce(getComputeRuntimeFunc, 300),
    [getComputeRuntimeFunc]
  )

  // Fetch runtime data on search or initial load
  useEffect(() => {
    const payload: GetComputeRuntimeInput = {
      search_query: searchQuery,
      offset: 0,
      page_size: PAGE_SIZE,
      class: null,
      type: null,
      is_deleted: false
    }
    getComputeRuntimeDebounced(payload, null)
  }, [searchQuery, getComputeRuntimeDebounced])

  // Process runtime classes data
  const runtimeClasses = useMemo(() => {
    return (
      computeRuntime?.data?.map((item) => ({
        class: item.class,
        total_count: item.total_count,
        runtimes: item.runtimes
      })) || []
    )
  }, [computeRuntime?.data])

  // Create lookup for creator names
  const createdByName = useMemo(() => {
    return runtimeClasses
      .filter((item) => item.class === RuntimeClass.CUSTOM)
      .flatMap((item) => item.runtimes)
      .flatMap((item) => item.runtime_list)
      .reduce((acc, runtime) => {
        acc[runtime.id] = runtime.created_by
        return acc
      }, {})
  }, [runtimeClasses])

  // Generate options for dropdown
  const generateOptions = useCallback(
    (runtimeList: any, envClass: string, type: string) => {
      const optionsObj: IDropdownList<string>[] = [
        {
          id: RuntimeOptionIds.TYPE_HEADER,
          label: `${type} (${runtimeList.count})`,
          value: `${type} (${runtimeList.count})`,
          class: envClass,
          type: type,
          link: '',
          count: 0,
          spark_config: false
        }
      ]
      runtimeList.runtime_list.forEach((runtime) => {
        optionsObj.push({
          id: runtime.id,
          label: getRuntimeLabelAndValue(runtime),
          value: runtime.runtime,
          class: envClass,
          type: type,
          link: runtime.reference_link,
          count: runtimeList.count,
          spark_config: runtime.spark_connect || runtime.spark_auto_init
        })
      })

      const remainingRuntimeCount =
        runtimeList.count - runtimeList.runtime_list.length
      if (Boolean(remainingRuntimeCount)) {
        optionsObj.push({
          id: RuntimeOptionIds.LOAD_MORE,
          label: '',
          value: remainingRuntimeCount?.toString(),
          class: envClass,
          type: type,
          link: '',
          count: runtimeList.count,
          spark_config: false
        })
      }
      return optionsObj
    },
    []
  )

  // Get all options for current selected environment
  const getOptions = (selectedEnv: string) => {
    let options: IDropdownList<string>[] = [
      {
        id: RuntimeOptionIds.CLASS_HEADER,
        label: '',
        value: '',
        class: '',
        type: '',
        link: ''
      }
    ]

    runtimeClasses.forEach((runtimeClass) => {
      if (selectedEnv === runtimeClass.class) {
        options = [
          ...options,
          ...runtimeClass.runtimes.flatMap((item) =>
            generateOptions(item, runtimeClass.class, item.type)
          )
        ]
      }
    })
    return options
  }

  // Handle "Load More" button click
  const onMoreButtonClick = useCallback(
    (selectedEnv: string, type: string, total_runtimes: number) => {
      const payload: GetComputeRuntimeInput = {
        search_query: searchQuery,
        offset: 0,
        page_size: total_runtimes,
        class: selectedEnv,
        type: type,
        is_deleted: false
      }
      getComputeRuntimeFunc(payload, computeRuntime)
    },
    [searchQuery, computeRuntime]
  )

  // Ensure dropdown value is never null
  const autocompleteValue = useMemo(() => {
    return dropDownValue || {id: -1, label: '', value: ''}
  }, [dropDownValue])

  const getRuntimeTypeAndClass = (option: IDropdownList<string>) => {
    switch (option.id) {
      case RuntimeOptionIds.CLASS_HEADER:
        return (
          <div
            className={classes.runtimeTabs}
            onClick={(ev) => {
              ev.stopPropagation()
              ev.preventDefault()
            }}
          >
            {runtimeClasses.map((runtimeClass) => (
              <div
                key={runtimeClass.class}
                className={`${classes.runtimeTabDiv} ${
                  selectedEnv === runtimeClass.class
                    ? classes.runtimeTabDivActive
                    : ''
                }`}
                onClick={() => {
                  setSelectedEnv(runtimeClass.class as RuntimeClass)
                }}
              >
                {runtimeClass.class}
                <span
                  className={`${classes.runtimeTabSpan} ${
                    selectedEnv === runtimeClass.class
                      ? classes.runtimeTabSpanActive
                      : ''
                  }`}
                >
                  {runtimeClass.total_count}
                </span>
              </div>
            ))}
          </div>
        )

      case RuntimeOptionIds.TYPE_HEADER:
        return (
          <div
            className={classes.dropdownLiItemPlaceHolder}
            onClick={(ev) => {
              ev.stopPropagation()
              ev.preventDefault()
            }}
          >
            {option.label}
          </div>
        )

      case RuntimeOptionIds.LOAD_MORE:
        return (
          <div
            onClick={(ev) => {
              ev.stopPropagation()
              ev.preventDefault()
            }}
            className={classes.moreButton}
          >
            <Button
              variant={ButtonVariants.TERTIARY}
              buttonText={`${option.value} more`}
              onClick={() => {
                onMoreButtonClick(selectedEnv, option.type, option.count)
              }}
              trailingIcon={Icons.ICON_KEYBOARD_ARROW_DOWN}
              size={ButtonSizes.SMALL}
            />
          </div>
        )

      default:
        return (
          <div
            className={`${classes.dropdownLiItemContainer} ${
              dropDownValue && option && dropDownValue.value === option.value
                ? classes.selectedRuntime
                : ''
            }`}
          >
            <div className={classes.dropdownNameAlignment}>
              <div className={classes.dropdownLiName}>{option.label}</div>
              {option.link && option.link !== '' && (
                <LaunchRoundedIcon
                  fontSize='small'
                  className={classes.dropDownLinkIcon}
                  onClick={() => {
                    window.open(option.link, '_blank')
                  }}
                />
              )}
            </div>
            {selectedEnv === RuntimeClass.CUSTOM && (
              <div className={classes.dropdownLiCreatedBy}>
                By: {createdByName[option.id]}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <Autocomplete
      disabled={disabled}
      onChange={(_, val: IDropdownList<string>) => onChange(val)}
      value={autocompleteValue}
      disablePortal={true}
      className={classes.customAutocomplete}
      id='runtime-select'
      filterOptions={() =>
        computeRuntime?.status === API_STATUS.LOADING
          ? []
          : getOptions(selectedEnv)
      }
      options={
        computeRuntime?.status === API_STATUS.LOADING
          ? []
          : getOptions(selectedEnv)
      }
      autoHighlight
      getOptionLabel={(option: IDropdownList<string>) => option.label}
      noOptionsText={
        computeRuntime?.status === API_STATUS.LOADING ? (
          <div className={classes.loaderContainer}>
            <ShellLoading width={240} height={100} />
          </div>
        ) : (
          <div
            className={classes.dropdownLiItemPlaceHolder}
            onClick={(ev) => {
              ev.stopPropagation()
              ev.preventDefault()
            }}
          >
            No options Available!
          </div>
        )
      }
      onInputChange={(ev, val, reason) => {
        if (reason === 'input') {
          setSearchQuery(val)
        } else if (reason === 'clear') {
          setSearchQuery('')
        }
      }}
      renderOption={(props, option, state: AutocompleteRenderOptionState) => (
        <Box
          component='li'
          sx={{
            padding:
              option.id === RuntimeOptionIds.CLASS_HEADER
                ? '4px'
                : '4px !important'
          }}
          {...props}
          key={'runtimeDropdownBox'}
        >
          {getRuntimeTypeAndClass(option)}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          disabled={disabled}
          onBlur={() => onBlur()}
          error={Boolean(error)}
          sx={inputStyles}
          className={classes.customTextField}
          label={'Runtime'}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off' // disable autocomplete and autofill
          }}
          helperText={Boolean(error) && assistiveText}
        />
      )}
    />
  )
}

const mapStateToProps = (state: CommonState) => ({
  computeRuntime: state.computeReducer.computeRuntime,
  computeRuntimeDetails: state.computeReducer.computeRuntimeDetails
})

const mapDispatchToProps = (dispatch) => {
  return {
    getComputeRuntimeFunc: (payload, prevData) => {
      getComputeRuntime(dispatch, payload, prevData)
    },
    getComputeRuntimeDetailsFunc: (payload) => {
      getComputeRuntimeDetails(dispatch, payload)
    }
  }
}

const styleComponent = compose(
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps, mapDispatchToProps)
)(RuntimeDrop)

export default styleComponent
