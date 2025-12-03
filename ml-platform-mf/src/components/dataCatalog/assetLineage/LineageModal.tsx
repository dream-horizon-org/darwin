import {Dialog, DialogContent, DialogTitle} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {Typography} from '../../../bit-components/typography/index'
import {SelectionOnData} from '../../../modules/catalog/graphqlApis/searchAssets/index'
import AssetLineage from './index'
import lineageModalStyles from './LineageModalJSS'

interface IProps extends WithStyles<typeof lineageModalStyles> {
  isOpen: boolean
  onClose: () => void
  assetClicked: SelectionOnData
}

const LineageModal = (props: IProps) => {
  const {classes, isOpen, onClose, assetClicked} = props

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      classes={{
        paper: classes.modalPaper
      }}
      className={classes.modal}
    >
      <DialogTitle className={classes.modalHeader}>
        <div className={classes.headerContent}>
          <Typography className={classes.modalTitle}>Asset Lineage</Typography>
          <Typography className={classes.modalSubtitle}>
            {assetClicked?.asset_prefix && assetClicked?.asset_name
              ? `${assetClicked.asset_prefix}:${assetClicked.asset_name}`
              : 'No asset selected'}
          </Typography>
        </div>
        <IconButton
          onClick={onClose}
          leadingIcon={Icons.ICON_CLOSE}
          actionableVariants={ActionableIconButtonVariants.ACTIONABLE_SECONDARY}
          size={IconButtonSizes.LARGE}
          actionable={true}
        />
      </DialogTitle>
      <DialogContent className={classes.modalContent}>
        <AssetLineage assetClicked={assetClicked} />
      </DialogContent>
    </Dialog>
  )
}

export default withStyles(lineageModalStyles)(LineageModal)
