import RefreshIcon from '@mui/icons-material/Refresh'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useState} from 'react'
import {compose} from 'redux'
import {LoaderSize} from '../../../bit-components/progress-circle/index'
import {ProgressCircle} from '../../../bit-components/progress-circle/index'
import {Search} from '../../../bit-components/search/index'
import {Typography} from '../../../bit-components/typography/index'
import {useCatalogStore} from '../../../modules/catalog/store/catalogStore'
import {RAISING_HAND_EMOJI} from '../constant'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  handleSearch: (searchTerm: string) => void
  handleRefreshClick: () => void
  isReloading: boolean
}

const SearchAssets = (props: IProps) => {
  const {classes, handleSearch, handleRefreshClick, isReloading} = props
  const {searchAssets, searchQuery} = useCatalogStore()

  return (
    <div>
      <div className={classes.InfoBarContainer}>
        <div className={classes.infoBarTextContainer}>
          <span>{RAISING_HAND_EMOJI}</span>
          <span>
            <Typography className={classes.infoBarText}>
              All your databases & tables in one place!
            </Typography>
          </span>
        </div>
        <div
          onClick={(e) => {
            handleRefreshClick()
          }}
        >
          {isReloading ? (
            <ProgressCircle size={LoaderSize.ExtraSmall} />
          ) : (
            <RefreshIcon className={classes.refreshIcon} fontSize='small' />
          )}
        </div>
      </div>
      <div className={classes.searchContainer}>
        <Search
          placeholder={'Search databases, tables...'}
          autoComplete={'off'}
          autoSearch={true}
          onSearch={() => {}}
          onAutoSearchChange={(searchTerm) => handleSearch(searchTerm)}
          initiaValue={searchQuery}
        />
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  SearchAssets
)

export default StyleComponent
