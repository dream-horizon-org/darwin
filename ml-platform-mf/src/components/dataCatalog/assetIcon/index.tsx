import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import config from 'config'
import React from 'react'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'

interface IProps {
  source: SelectionOnData
}

const AssetIcon = (props: IProps) => {
  const {source} = props
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens

  const getAssetIcon = (source: SelectionOnData) => {
    if (source.depth === 2) {
      return <span></span>
    }

    if (source.is_terminal) {
      return (
        <TableChartOutlinedIcon
          fontSize='small'
          sx={{color: aliasTokens.iconSecondary}}
        />
      )
    }

    if (source.depth === 3) {
      if (source.asset_prefix.includes('redshift')) {
        return (
          <img
            src={`${config.cfMsdAssetUrl}/icons/darwin-schema-icon.svg`}
            alt=''
          />
        )
      } else {
        return (
          <img
            src={`${config.cfMsdAssetUrl}/icons/darwin-database-icon.svg`}
            alt=''
          />
        )
      }
    }

    if (source.depth === 4) {
      return (
        <img
          src={`${config.cfMsdAssetUrl}/icons/darwin-database-icon.svg`}
          alt=''
        />
      )
    }

    return null
  }

  return <div>{getAssetIcon(source)}</div>
}

export default AssetIcon
