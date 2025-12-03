import Add from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import React, {useEffect} from 'react'
import {Dropdown} from '../../../../bit-components/dropdown/index'
import {ShellLoading} from '../../../../bit-components/shell-loading/index'
import {IEdgeModelsState} from '../../data/reducer'
import {Flow} from '../../data/types'
import {mapAppVersionLabel} from '../../data/utils'
import {SelectionOnVersions} from '../../graphQL/queries/getAppVersions'

interface CompatibleAppVersionResponse {
  platform: string
  version: string
  versionId: string
}

export const CompatibleServiceSection = (props: {
  flow: Flow
  isEditable: IEdgeModelsState['isEditable']
  compatibleAppVersionsResp: SelectionOnVersions[]
  compatibleAppVersions: string[]
  setCompatibleAppVersions: (payload: string[]) => void
  classes
}) => {
  const {
    flow,
    isEditable,
    compatibleAppVersionsResp,
    setCompatibleAppVersions,
    compatibleAppVersions,
    classes
  } = props

  const [rows, setRows] = React.useState([])

  useEffect(() => {
    if (flow !== Flow.CREATE && compatibleAppVersions?.length > 0) {
      if (rows.length < compatibleAppVersions.length)
        setRows(Array.from({length: compatibleAppVersions.length}, (_, i) => i))
    }
  }, [flow, compatibleAppVersions])

  const getCompatibleAppVersionById = (
    id: string
  ): CompatibleAppVersionResponse | null => {
    for (const item of compatibleAppVersionsResp) {
      const matchingAppVersion = item.appVersions.find(
        (appVersion) => appVersion.id === id
      )
      if (matchingAppVersion) {
        return {
          platform: item.appName,
          version: matchingAppVersion.codepushVersion
            ? `${matchingAppVersion.semver} - (${matchingAppVersion.codepushVersion})`
            : matchingAppVersion.semver,
          versionId: matchingAppVersion.id
        }
      }
    }
    return null
  }

  return (
    <div className={classes.section} style={{marginBottom: 120}}>
      <div className={classes.eventTableSectionHeader}>
        <h5 style={{color: '#D9D9D9'}}>Compatible Service</h5>
      </div>
      <div className={classes.rowWrapper}>
        {rows.map((value, index) => {
          const selectedRow =
            compatibleAppVersions?.length > 0 && flow !== Flow.CREATE
              ? getCompatibleAppVersionById(compatibleAppVersions[index])
              : undefined // avoid in create flow
          return (
            <CompatibleServiceRow
              flow={flow}
              isEditable={isEditable}
              compatibleAppVersionsResp={compatibleAppVersionsResp}
              setCompatibleAppVersions={setCompatibleAppVersions}
              compatibleAppVersions={compatibleAppVersions}
              key={value}
              index={index}
              setRows={setRows}
              rows={rows}
              classes={classes}
              selectedRow={selectedRow}
            />
          )
        })}
      </div>
      {(flow === Flow.CREATE ||
        (flow === Flow.Edit && isEditable.compatibleAppVersion)) && (
        <Button
          size='small'
          startIcon={<Add />}
          onClick={() => {
            setRows([...rows, rows.length])
          }}
          disabled={
            compatibleAppVersionsResp?.length === 0 ||
            (flow === Flow.Edit && !isEditable.compatibleAppVersion)
          }
          style={{textTransform: 'none'}}
        >
          Add
        </Button>
      )}
    </div>
  )
}

const CompatibleServiceRow = (props: {
  flow: Flow
  isEditable: IEdgeModelsState['isEditable']
  compatibleAppVersionsResp: SelectionOnVersions[]
  setCompatibleAppVersions: (payload: string[]) => void
  compatibleAppVersions: string[]
  index: number
  setRows: (payload: any) => void
  rows: any
  classes
  selectedRow: CompatibleAppVersionResponse
}) => {
  const {
    flow,
    isEditable,
    compatibleAppVersionsResp,
    setCompatibleAppVersions,
    compatibleAppVersions,
    index,
    setRows,
    rows,
    classes,
    selectedRow
  } = props
  const [platformAppVersions, setPlatformAppVersions] = React.useState<
    {
      label: string
      value: string
    }[]
  >([])

  const onAppVersionChange = (
    e: React.SyntheticEvent,
    values: {value: string}
  ) => {
    const newCompatibleAppVersions = [...compatibleAppVersions]
    if (newCompatibleAppVersions.includes(values.value)) {
      return
    }
    newCompatibleAppVersions[index] = values.value
    setCompatibleAppVersions(newCompatibleAppVersions)
  }

  const onDeleteRow = () => {
    const newRows = [...rows]
    newRows.splice(index, 1)
    setRows(newRows)
    const newCompatibleAppVersions = [...compatibleAppVersions]
    newCompatibleAppVersions.splice(index, 1)
    setCompatibleAppVersions(newCompatibleAppVersions)
  }

  useEffect(() => {
    if (
      flow !== Flow.CREATE &&
      compatibleAppVersionsResp?.length > 0 &&
      compatibleAppVersions?.length > 0 &&
      selectedRow
    ) {
      const selectedPlatform = compatibleAppVersionsResp.find(
        (version) => version.appName === selectedRow.platform
      )
      setPlatformAppVersions(
        mapAppVersionLabel(selectedPlatform?.appVersions) || []
      )
    }
  }, [flow, compatibleAppVersions, compatibleAppVersionsResp])

  useEffect(() => {
    const platformContainer = document.querySelector(`
  [data-testid="compatibleServiceDropdown-platform-${index}"]`)
    const appVersionContainer = document.querySelector(`
        [data-testid="compatibleServiceDropdown-appVersion-${index}"]`)
    if (platformContainer) {
      const inputElement = platformContainer.querySelector('input')
      if (inputElement) {
        inputElement.placeholder = 'Platform'
      }
    }
    if (appVersionContainer) {
      const inputElement = appVersionContainer.querySelector('input')
      if (inputElement) {
        inputElement.placeholder = 'App Version/Codepush'
      }
    }
  }, [rows])

  const isCodepushVersionDisabled =
    flow === Flow.Detail ||
    compatibleAppVersionsResp?.length === 0 ||
    (flow === Flow.Edit && !isEditable.compatibleAppVersion)

  const isAppVersionDisabled =
    flow === Flow.Detail ||
    platformAppVersions?.length === 0 ||
    (flow === Flow.Edit && !isEditable.compatibleAppVersion)

  if (!compatibleAppVersionsResp || compatibleAppVersionsResp?.length === 0) {
    return (
      <div className={classes.compatibleServiceContainer}>
        <div className={classes.compatibleServiceDropdown}>
          <ShellLoading height={30} width={474} />
        </div>
        <div className={classes.compatibleServiceDropdown}>
          <ShellLoading height={30} width={474} />
        </div>
        <div className={classes.compatibleServiceDropdown}>
          <ShellLoading height={30} width={46} />
        </div>
      </div>
    )
  }

  return (
    <div className={classes.compatibleServiceContainer}>
      <div className={classes.compatibleServiceDropdown}>
        <Dropdown
          onChange={(e, values) => {
            const selectedPlatform = compatibleAppVersionsResp.find(
              (version) => version.appName === values.value
            )
            if (selectedPlatform) {
              setPlatformAppVersions(
                mapAppVersionLabel(selectedPlatform?.appVersions) || []
              )
            }
          }}
          menuLists={
            compatibleAppVersionsResp?.length > 0
              ? compatibleAppVersionsResp.map((version) => {
                  return {label: version.appName, value: version.appName}
                })
              : []
          }
          disableClearable={true}
          disabled={isCodepushVersionDisabled}
          defaultValue={
            flow !== Flow.CREATE && selectedRow
              ? {
                  label: selectedRow.platform,
                  value: selectedRow.platform
                }
              : undefined
          }
          dataTestId={`compatibleServiceDropdown-platform-${index}`}
          fieldVariant='withOutline'
        />
      </div>
      <div
        className={
          platformAppVersions?.length === 0
            ? classes.compatibleServiceDropdownDisabled
            : classes.compatibleServiceDropdown
        }
      >
        <Dropdown
          onChange={(e, values) => onAppVersionChange(e, values)}
          menuLists={
            platformAppVersions?.length > 0
              ? platformAppVersions.map((version) => {
                  return {label: version.label, value: version.value}
                })
              : []
          }
          disableClearable={true}
          disabled={isAppVersionDisabled}
          defaultValue={
            flow !== Flow.CREATE && selectedRow
              ? {
                  label: selectedRow.version,
                  value: selectedRow.version
                }
              : undefined
          }
          dataTestId={`compatibleServiceDropdown-appVersion-${index}`}
          fieldVariant='withOutline'
        />
      </div>
      <div className={classes.compatibleServiceDelete}>
        <DeleteIcon
          style={{color: '#8F8F8F'}}
          onClick={
            flow === Flow.CREATE ||
            (flow === Flow.Edit && isEditable.compatibleAppVersion)
              ? onDeleteRow
              : undefined
          }
        />
      </div>
    </div>
  )
}
