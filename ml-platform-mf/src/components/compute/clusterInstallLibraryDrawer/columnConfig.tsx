import {Tooltip as TooltipMUI} from '@mui/material'
import React, {MouseEventHandler} from 'react'
import {TableCells} from '../../../bit-components/datatable/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {TableCellAlignment} from '../../../bit-components/table-cells/tc-cell/index'

import {Controller} from 'react-hook-form'
import {Button, ButtonVariants} from '../../../bit-components/button/index'
import {Dropdown} from '../../../bit-components/dropdown/index'
import {CLUSTER_LIBRARY_STATUS} from '../../../modules/compute/pages/constant'
import {truncate} from '../../../utils/helper'

export type Data = {
  group_id: string
  artifact_id: string
  version: string
}

export const getColumnConfig = (
  classes,
  control,
  getMavenPackageVersionsFunc,
  selectedMavenPackageVersions,
  setSelectedMavenPackage
  // handleShowMoreTagsClicked: (
  //     e: React.MouseEvent<HTMLSpanElement>,
  //     item: Data
  // ) => void,
  // handleMenuClick: (
  //     e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  //     workflow: Data
  // ) => void
) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <TooltipMUI title={item.group_id.length > 30 ? item.group_id : ''}>
              <div>{truncate(item.group_id, 30)}</div>
            </TooltipMUI>
          )
        }
      },
      headerProps: {
        headerLabel: 'Group ID',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: <div>{item.artifact_id}</div>
        }
      },
      headerProps: {
        headerLabel: 'Artifact ID',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 3,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <div style={{width: '150px'}}>
              <Controller
                name={`versionsDropdown_${item.group_id}_${item.artifact_id}`}
                control={control}
                render={({field}) => (
                  <Dropdown
                    menuLists={selectedMavenPackageVersions}
                    label={''}
                    onChange={(ev, val) => {
                      item.version = val.value
                      field.onChange(val)
                    }}
                    dropDownValue={
                      field.value || {
                        id: -1,
                        label: item.version,
                        value: item.version
                      }
                    }
                    onFocus={() => {
                      getMavenPackageVersionsFunc({
                        group_id: item.group_id,
                        artifact_id: item.artifact_id
                      })
                    }}
                  />
                )}
              />
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Release Versions',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 4,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: Data) => {
        return {
          jsx: (
            <Button
              buttonText='Select'
              onClick={() =>
                setSelectedMavenPackage(
                  `${item.group_id}:${item.artifact_id}:${item.version}`
                )
              }
              variant={ButtonVariants.TERTIARY}
            />
          )
        }
      }
    }
  ]
}
