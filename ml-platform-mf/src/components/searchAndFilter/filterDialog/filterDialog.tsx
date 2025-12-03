import CloseIcon from '@mui/icons-material/Close'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  OutlinedInput,
  Typography
} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'
import {compose} from 'redux'
import {IOwner, ITag, OWNER, TAG} from '../../../types/filters.type'

import styles from './filterDialogJSS'

interface IProps extends WithStyles<typeof styles> {
  owners: IOwner[]
  tags: ITag[]
  showAllTags?: boolean
  onShowAllTagsToggle: () => void
  openFilterDialog: boolean
  onOpenFilterDialogChange: (value: boolean) => void
  onFilterClicked: (type, index) => void
  onApplyFilterClicked: () => void
  filterSearchInput: string
  onFilterSearched: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void
  clearAllFilters: () => void
}

const TAGS_TO_DISPLAY = 10

const FilterDialog = (props: IProps) => {
  const {classes} = props
  const onDialogClose = () => {
    props.onOpenFilterDialogChange(false)
  }

  let tagsToDisplay = props.tags
  let ownersToDisplay = props.owners
  if (props.filterSearchInput) {
    tagsToDisplay = props.tags.filter((tag) =>
      tag.name
        .toLocaleLowerCase()
        .includes(props.filterSearchInput.toLowerCase())
    )

    ownersToDisplay = props.owners.filter((owner) =>
      owner.name
        .toLocaleLowerCase()
        .includes(props.filterSearchInput.toLocaleLowerCase())
    )
  } else {
    tagsToDisplay = props.showAllTags ? props.tags : props.tags.slice(0, 10)
  }

  return (
    <Dialog
      open={props.openFilterDialog}
      onClose={onDialogClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      fullWidth
      maxWidth='sm'
    >
      <div className={classes.filterHeader}>
        <DialogTitle
          id='alert-dialog-slide-title'
          className={classes.dialogTitle}
        >
          <div className={classes.filterHeaderContent}>
            <Typography variant='h6' className={classes.filterTitleHeading}>
              FILTERS
            </Typography>
            <CloseIcon
              onClick={onDialogClose}
              className={classes.filterDialogCloseIcon}
            />
          </div>
        </DialogTitle>
      </div>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>
          <OutlinedInput
            id='outlined-adornment-amount'
            endAdornment={<SearchIcon />}
            placeholder='Search filters...'
            fullWidth
            value={props.filterSearchInput}
            onChange={props.onFilterSearched}
          />
          <div className={classes.tagsList}>
            <Typography variant='h6'>Tags</Typography>
            <div className={classes.tagListGrid}>
              {tagsToDisplay.map((tag, idx) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      name='checkedB'
                      color='primary'
                      checked={tag.selected}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        props.onFilterClicked(TAG, tag.name)
                      }
                    />
                  }
                  label={tag.name}
                />
              ))}
            </div>
          </div>
          {props.tags.length > TAGS_TO_DISPLAY &&
          !props.showAllTags &&
          !props.filterSearchInput ? (
            <div
              className={classes.viewMoreTags}
              onClick={props.onShowAllTagsToggle}
            >
              <Typography variant='body1'>View all tags</Typography>
              <ExpandMoreIcon />
            </div>
          ) : props.tags.length > TAGS_TO_DISPLAY &&
            !props.filterSearchInput ? (
            <div
              className={classes.viewMoreTags}
              onClick={props.onShowAllTagsToggle}
            >
              <Typography variant='body1'>View less tags</Typography>
              <ExpandLessIcon />
            </div>
          ) : null}
          <Divider className={classes.divider} />
          <div className={classes.ownerList}>
            <Typography variant='h6'>Owners</Typography>
            <div className={classes.ownerListGrid}>
              {ownersToDisplay.map((owner, idx) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      name='checkedB'
                      color='primary'
                      checked={owner.selected}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        props.onFilterClicked(OWNER, owner.name)
                      }
                    />
                  }
                  label={owner.name}
                />
              ))}
            </div>
          </div>
        </DialogContentText>
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <Button color='primary' onClick={props.clearAllFilters}>
          CLEAR ALL
        </Button>
        <Button
          variant='contained'
          color='primary'
          autoFocus
          onClick={props.onApplyFilterClicked}
        >
          APPLY
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  FilterDialog
)

export default styleComponent
