import {Tooltip as TooltipMUI} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {compose} from 'redux'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Datatable} from '../../../bit-components/datatable/index'
import {Icons} from '../../../bit-components/icon/index'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {TableCellSize} from '../../../bit-components/table-cells/tc-cell/index'
import {Typography} from '../../../bit-components/typography/index'
import {
  GetCatalogAssetsInput,
  SelectionOnGetCatalogAssets
} from '../../../modules/catalog/graphqlApis/getCatalogAssets'
import {GetCatalogAssets} from '../../../modules/catalog/graphqlApis/getCatalogAssets'
import {GetCatalogAssetsSchema} from '../../../modules/catalog/graphqlApis/getCatalogAssets/index.gqlTypes'
import {GQL as getCatalogAssetsGql} from '../../../modules/catalog/graphqlApis/getCatalogAssets/indexGql'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {truncate} from '../../../utils/helper'
import {useGQL} from '../../../utils/useGqlRequest'
import {copyFunction, getAssetSchema} from '../utils'
import {
  AssetData,
  FieldData,
  getAssetDetailsColumnConfig,
  getFieldsColumnConfig
} from './columnConfig'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  assetClicked: SelectionOnData
  onShowLineage?: () => void
}

const AssetDetails = (props: IProps) => {
  const {
    output: {
      response: catalogAssetsData,
      loading: catalogAssetsLoading,
      errors: catalogAssetsError
    },
    triggerGQLCall: triggerGetCatalogAssets
  } = useGQL<GetCatalogAssetsInput, GetCatalogAssets>()
  const {classes, assetClicked, onShowLineage} = props
  const pageSize = 20
  const zeroOffset = 0
  const textDisplayLimit = 22
  const shellWidth = 100
  const shellHeight = 20
  const pathTruncateLength = 40
  const s3Path =
    catalogAssetsData?.getCatalogAssets?.assets?.[0]?.metadata?.path || ''
  const exactMatch = `^${assetClicked.asset_prefix}:${assetClicked.asset_name}$`
  const allMatches = `^${assetClicked.asset_prefix}:${assetClicked.asset_name}:.*`
  const [offset, setOffset] = useState(zeroOffset)
  const [paginatedData, setPaginatedData] =
    useState<SelectionOnGetCatalogAssets | null>(null)

  useEffect(() => {
    setOffset(zeroOffset)
    setPaginatedData(null)
  }, [assetClicked])

  useEffect(() => {
    if (!catalogAssetsData?.getCatalogAssets) {
      return
    }

    const newData = catalogAssetsData.getCatalogAssets

    setPaginatedData((prev) => {
      if (offset === zeroOffset) {
        return newData
      }

      if (prev && prev.assets && newData.assets) {
        const combinedData = {
          ...newData,
          assets: [...prev.assets, ...newData.assets]
        }
        return combinedData
      }

      return newData
    })
  }, [catalogAssetsData, offset])

  useEffect(() => {
    if (
      !assetClicked ||
      !assetClicked.asset_prefix ||
      !assetClicked.asset_name
    ) {
      return
    }

    const regex = assetClicked.is_terminal ? exactMatch : allMatches
    const variables = {
      regex: regex,
      page_size: pageSize,
      offset: offset
    }
    triggerGetCatalogAssets(
      {...getCatalogAssetsGql, variables},
      GetCatalogAssetsSchema
    )
  }, [offset, assetClicked])

  const listingTableData = () => {
    if (!paginatedData?.assets) {
      return []
    }

    const tableData = paginatedData.assets.map((asset) => {
      const keyword = `${assetClicked.asset_prefix}:${assetClicked.asset_name}:`
      const splittedData =
        asset?.fqdn?.split(keyword).length > 1
          ? asset.fqdn.split(keyword)[1].split(':')[0]
          : ''
      return {
        id: asset?.fqdn || '',
        name: splittedData,
        asset_created_at: asset?.asset_created_at,
        asset_updated_at: asset?.asset_updated_at
      }
    })
    return tableData
  }

  useEffect(() => {
    listingTableData()
  }, [paginatedData])

  const handleCopyButtonClick = () => {
    if (assetClicked?.is_terminal) {
      const db = assetClicked?.asset_prefix.split(':').slice(-1)[0]
      const table = assetClicked?.asset_name
      const type =
        catalogAssetsData?.getCatalogAssets?.assets?.[0]?.metadata?.type || ''
      navigator.clipboard.writeText(
        copyFunction(db, table, type, assetClicked?.asset_prefix)
      )
    }
  }

  const columnConfig = assetClicked?.is_terminal
    ? getFieldsColumnConfig(classes)
    : getAssetDetailsColumnConfig(classes)

  const assetSource = assetClicked?.asset_prefix
    ? assetClicked?.asset_prefix.split(':')
    : []

  const tableData = assetClicked?.is_terminal
    ? getAssetSchema(paginatedData?.assets?.[0]?.asset_schema?.schema_json) ||
      []
    : listingTableData() || []

  return (
    <div className={classes.container}>
      <div className={classes.assetTitleContainer}>
        <div className={classes.assetTitle}>
          <span>
            <Typography className={classes.assetSource}>
              {assetSource.length > 2
                ? assetSource.slice(2).join(' / ')
                : assetSource.join(':')}
            </Typography>
          </span>
          <span>
            <Typography className={classes.tableName}>
              <TooltipMUI
                title={
                  assetClicked?.asset_name.length > textDisplayLimit
                    ? assetClicked?.asset_name
                    : ''
                }
              >
                <span>
                  {truncate(assetClicked?.asset_name, textDisplayLimit)}
                </span>
              </TooltipMUI>
            </Typography>
          </span>
        </div>
        {assetClicked?.is_terminal && (
          <div className={classes.buttonContainer}>
            <Button
              buttonText='Spark DF'
              onClick={handleCopyButtonClick}
              variant={ButtonVariants.PRIMARY}
              leadingIcon={Icons.ICON_COPY}
              size={ButtonSizes.LARGE}
              disabled={catalogAssetsLoading}
            />
          </div>
        )}
      </div>

      <div className={classes.editAssetDetailsContainer}>
        <div className={classes.editDetailsItem}>
          <span>
            <Typography className={classes.textLabel}>Created at</Typography>
          </span>
          <span>
            <Typography className={classes.textValue}>
              {assetClicked?.is_terminal && catalogAssetsLoading ? (
                <ShellLoading width={shellWidth} height={shellHeight} />
              ) : assetClicked?.is_terminal ? (
                new Date(
                  Number(paginatedData?.assets?.[0]?.asset_created_at)
                ).toLocaleString()
              ) : (
                '-'
              )}
            </Typography>
          </span>
          <span></span>
        </div>
        <div className={classes.editDetailsItem}>
          <span>
            <Typography className={classes.textLabel}>
              Last Updated at
            </Typography>
          </span>
          <span>
            <Typography className={classes.textValue}>
              {assetClicked?.is_terminal && catalogAssetsLoading ? (
                <ShellLoading width={shellWidth} height={shellHeight} />
              ) : assetClicked?.is_terminal ? (
                new Date(
                  Number(paginatedData?.assets?.[0]?.asset_updated_at)
                ).toLocaleString()
              ) : (
                '-'
              )}
            </Typography>
          </span>
          <span></span>
        </div>
        <div className={classes.editDetailsItem}>
          <span>
            <Typography className={classes.textLabel}>Path</Typography>
          </span>
          <span>
            <Typography className={classes.textValue}>
              {assetClicked?.is_terminal && catalogAssetsLoading ? (
                <ShellLoading width={shellWidth} height={shellHeight} />
              ) : assetClicked?.is_terminal ? (
                <TooltipMUI
                  title={s3Path.length > pathTruncateLength ? s3Path : ''}
                >
                  <span>{truncate(s3Path, pathTruncateLength)}</span>
                </TooltipMUI>
              ) : (
                '-'
              )}
            </Typography>
          </span>
          {s3Path && s3Path.length > 1 && assetClicked?.is_terminal ? (
            <span
              className={`${Icons.ICON_COPY} ${classes.pathCopyIcon}`}
              onClick={() => {
                navigator.clipboard.writeText(s3Path)
              }}
            />
          ) : (
            <span></span>
          )}
        </div>
      </div>

      <div>
        <div className={classes.overviewHeaderContainer}>
          <Typography className={classes.overviewText}>Overview</Typography>
          {assetClicked?.is_terminal && (
            <Button
              buttonText='View Lineage'
              onClick={onShowLineage}
              variant={ButtonVariants.SECONDARY}
              leadingIcon={Icons.ICON_SHUFFLE}
              size={ButtonSizes.SMALL}
              disabled={catalogAssetsLoading}
            />
          )}
        </div>
        <div className={classes.datatableContainer} key={''}>
          <Datatable<FieldData | AssetData>
            enablePagination={false}
            enableSelection={false}
            singleSelection={false}
            enableStickyHeader={true}
            enableHeader={true}
            size={TableCellSize.Large}
            columnConfig={columnConfig}
            data={tableData}
            indexKeyName={'id'}
            enableInfiniteScroll={!assetClicked?.is_terminal}
            loading={catalogAssetsLoading && offset === 0}
            tableContainerHeight={'calc(100vh - 400px)'}
            onScrollToPageEnd={() => {
              if (catalogAssetsLoading) {
                return
              }
              if (offset + pageSize < paginatedData?.total) {
                setOffset(offset + pageSize)
              }
            }}
            loadingNextPageItems={catalogAssetsLoading && offset === zeroOffset}
            totalRow={
              !assetClicked?.is_terminal
                ? paginatedData?.total || 0
                : tableData?.length || 0
            }
          />
        </div>
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  AssetDetails
)

export default StyleComponent
