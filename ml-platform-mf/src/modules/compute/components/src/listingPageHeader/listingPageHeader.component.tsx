import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {Button} from '../../../../../bit-components/button/index'
import {Icons} from '../../../../../bit-components/icon/index'
import SearchBar from '../../../../../components/searchBar'
import {routes} from '../../../../../constants'
import {useQueryParams} from '../../../../../hooks/src/useQueryParams/useQueryParams.hook'
import {ClusterListingQueryParams} from '../../../types'
import styles from './listingPageHeaderJSS'

interface IProps extends WithStyles<typeof styles> {}

const ListingPageHeader = (props: IProps) => {
  const {classes} = props
  const [query, setQuery] = useQueryParams<ClusterListingQueryParams>()
  const history = useHistory()

  const onCreateClusterClicked = () => {
    history.push(routes.clusterCreatePage)
  }

  return (
    <div className={classes.container}>
      <div className={classes.left}>Clusters</div>
      <div className={classes.right}>
        <div className={classes.searchContainer}>
          <SearchBar
            placeholder={'Search Cluster, #tags...'}
            value={query.query}
            onValueChange={(value) => {
              setQuery({
                query: value,
                filters: {
                  ...query.filters
                }
              })
            }}
            dataTestestid='cluster-list-search-bar'
          />
        </div>
        <div className={classes.btnContainer}>
          <Button
            buttonText={'Create Cluster'}
            onClick={onCreateClusterClicked}
            leadingIcon={Icons.ICON_ADD_OUTLINED}
          />
        </div>
      </div>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ListingPageHeader)

export default StyleComponent
