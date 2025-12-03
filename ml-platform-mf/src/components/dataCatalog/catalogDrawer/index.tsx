import {Drawer} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Typography} from '../../../bit-components/typography/index'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import {useCatalogStore} from '../../../modules/catalog/store/catalogStore'
import AssetDetails from '../assetDetails'
import LineageModal from '../assetLineage/LineageModal'
import AssetListing from '../assetListing'
import styles from './indexJSS'
interface IProps extends WithStyles<typeof styles> {
  isOpen: boolean
  onClose: () => void
}

const CatalogDrawer = (props: IProps) => {
  const {classes, isOpen, onClose} = props
  const [isExtended, setIsExtended] = useState(false)
  const [showLineage, setShowLineage] = useState(false)
  const {
    resetExpandedItems,
    resetQuerySearchAssets,
    resetSearchAssets,
    resetSearchQuery
  } = useCatalogStore()
  const [assetClicked, setAssetClicked] = useState<SelectionOnData>(
    {} as SelectionOnData
  )
  const {theme} = useBitThemeContext()

  const handleExtendDrawer = () => {
    setIsExtended(true)
  }

  const handlCloseButton = () => {
    setIsExtended(false)
    setShowLineage(false)
    onClose()
    resetExpandedItems()
    resetQuerySearchAssets()
    resetSearchAssets()
    resetSearchQuery()
  }

  const handleShowLineage = () => {
    setShowLineage(true)
  }

  const handleBackToDetails = () => {
    setShowLineage(false)
  }

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      classes={{
        paper: isExtended ? classes.extendedDrawer : classes.createDrawer,
        modal: classes.rootDrawer
      }}
    >
      <div>
        <div className={classes.header}>
          <span>
            <Typography className={classes.headingTitle}>Catalog</Typography>
          </span>
          <IconButton
            onClick={handlCloseButton}
            leadingIcon={Icons.ICON_CLOSE}
            actionableVariants={
              ActionableIconButtonVariants.ACTIONABLE_SECONDARY
            }
            size={IconButtonSizes.LARGE}
            actionable={true}
          />
        </div>
        <hr className={classes.line} />
        <div className={classes.parentContainer}>
          <div className={classes.container}>
            <AssetListing
              handleExtendDrawer={handleExtendDrawer}
              setAssetClicked={setAssetClicked}
              assetClicked={assetClicked}
            />
          </div>
          {isExtended && (
            <div className={classes.extendedContainer}>
              <AssetDetails
                assetClicked={assetClicked}
                onShowLineage={handleShowLineage}
              />
            </div>
          )}
        </div>
      </div>
      <LineageModal
        isOpen={showLineage}
        onClose={handleBackToDetails}
        assetClicked={assetClicked}
      />
    </Drawer>
  )
}

export default withStyles(styles)(CatalogDrawer)
