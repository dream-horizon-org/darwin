import {Tooltip as TooltipMUI} from '@mui/material'
import React, {MouseEventHandler} from 'react'
import {TableCells} from '../../../bit-components/datatable/index'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {TableCellAlignment} from '../../../bit-components/table-cells/tc-cell/index'
import {Typography} from '../../../bit-components/typography/index'
import {truncate} from '../../../utils/helper'
import {dataType} from '../constant'

export type FieldData = {
  name: string
  type: string
  description: string
  is_pii: boolean
}

export type AssetData = {
  id: string
  name: string
  asset_created_at?: number
  asset_updated_at?: number
}

const getClassForDataType = (classes, type: string) => {
  switch (type) {
    case dataType.INT:
      return classes.bgTagWarning
    case dataType.BIGINT:
      return classes.bgTagSuccess
    case dataType.VARCHAR:
      return classes.bgTagGlobalBlue
    case dataType.TIMESTAMP:
      return classes.bgTagInfo
    case dataType.BOOLEAN:
      return classes.bgTagSuccess2
    case dataType.FLOAT:
      return classes.bgTagInfo2
    case dataType.DOUBLE:
      return classes.bgTagNeutral2
    case dataType.DECIMAL:
      return classes.bgTagError
    case dataType.DATE:
      return classes.bgTagInfo
    case dataType.STRING:
      return classes.bgTagAlert2

    default:
      return classes.bgTagGlobalBlue
  }
}

export const getFieldsColumnConfig = (classes) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: FieldData) => {
        return {
          jsx: (
            <div>
              <TooltipMUI title={item.name}>
                <Typography>{truncate(item.name, 30)}</Typography>
              </TooltipMUI>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Column Name',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: FieldData) => {
        return {
          jsx: (
            <div>
              <Typography className={getClassForDataType(classes, item.type)}>
                {item.type}
              </Typography>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Data Type',
        align: TableCellAlignment.Left
      }
    }
  ]
}

export const getAssetDetailsColumnConfig = (classes) => {
  return [
    {
      id: 1,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: AssetData) => {
        return {
          jsx: (
            <div>
              <TooltipMUI title={item.name.length > 25 ? item.name : ''}>
                <span>
                  <Typography>{truncate(item.name, 25)}</Typography>
                </span>
              </TooltipMUI>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Asset Name',
        align: TableCellAlignment.Left
      }
    },
    {
      id: 2,
      columnType: TableCells.TcCustomJSX,
      componentProps: (item: AssetData) => {
        return {
          jsx: (
            <div>
              <Typography>
                {item.asset_created_at && item.asset_updated_at
                  ? `${new Date(
                      Number(item.asset_created_at)
                    ).toLocaleDateString('en-CA')} / ${new Date(
                      Number(item.asset_updated_at)
                    ).toLocaleDateString('en-CA')}`
                  : 'N/A'}
              </Typography>
            </div>
          )
        }
      },
      headerProps: {
        headerLabel: 'Created At / Updated At',
        align: TableCellAlignment.Left
      }
    }
  ]
}
