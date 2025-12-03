import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {compose} from 'redux'
import {ShellLoading} from '../../../bit-components/shell-loading/index'
import {Typography} from '../../../bit-components/typography/index'
import {
  GetLineageAsset,
  GetLineageAssetInput,
  SelectionOnGetLineageAsset
} from '../../../modules/catalog/graphqlApis/getLineageAsset/index'
import {GetLineageAssetSchema} from '../../../modules/catalog/graphqlApis/getLineageAsset/index.gqlTypes'
import {GQL as getLineageAssetGql} from '../../../modules/catalog/graphqlApis/getLineageAsset/indexGql'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {useGQL} from '../../../utils/useGqlRequest'
import styles from './indexJSS'
import LineageGraph from './LineageGraph'

interface IProps extends WithStyles<typeof styles> {
  assetClicked: SelectionOnData
}

const AssetLineage = (props: IProps) => {
  const {
    output: {
      response: lineageData,
      loading: lineageLoading,
      errors: lineageError
    },
    triggerGQLCall: triggerGetLineageAsset
  } = useGQL<GetLineageAssetInput, GetLineageAsset>()

  const {classes, assetClicked} = props
  const shellWidth = 100
  const shellHeight = 20

  useEffect(() => {
    if (!assetClicked?.asset_name) {
      return
    }

    const assetName = `${assetClicked.asset_prefix}:${assetClicked.asset_name}`
    const encodedAssetName = encodeURIComponent(assetName)
    const variables = {
      assetName: encodedAssetName
    }

    triggerGetLineageAsset(
      {...getLineageAssetGql, variables},
      GetLineageAssetSchema
    )
  }, [assetClicked])

  const renderLineageGraph = () => {
    if (lineageLoading) {
      return (
        <div className={classes.loadingContainer}>
          <ShellLoading width={shellWidth} height={shellHeight} />
          <Typography className={classes.loadingText}>
            Loading lineage data...
          </Typography>
        </div>
      )
    }

    if (lineageError) {
      return (
        <div className={classes.errorContainer}>
          <Typography className={classes.errorText}>
            Error loading lineage data
          </Typography>
        </div>
      )
    }

    if (
      !lineageData?.getLineageAsset?.graph ||
      lineageData.getLineageAsset.graph.length === 0
    ) {
      return (
        <div className={classes.emptyContainer}>
          <Typography className={classes.emptyText}>
            No lineage data available for this asset
          </Typography>
        </div>
      )
    }

    return (
      <div className={classes.graphContainer}>
        <Typography className={classes.sectionTitle}>
          Asset Lineage Graph
        </Typography>
        <LineageGraph lineageData={lineageData.getLineageAsset} />

        {lineageData.getLineageAsset.assetsInfo && (
          <div className={classes.assetsInfoContainer}>
            <Typography className={classes.sectionTitle}>
              Assets Information
            </Typography>
            <div className={classes.assetsInfoContent}>
              <Typography className={classes.assetsInfoText}>
                {JSON.stringify(
                  lineageData.getLineageAsset.assetsInfo,
                  null,
                  2
                )}
              </Typography>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <div className={classes.content}>{renderLineageGraph()}</div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  AssetLineage
)

export default StyleComponent
