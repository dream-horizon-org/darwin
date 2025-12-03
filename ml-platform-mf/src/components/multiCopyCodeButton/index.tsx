import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Button from '@mui/material/Button'
import Menu, {MenuProps} from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {styled} from '@mui/material/styles'
import {withStyles, WithStyles} from '@mui/styles'
import * as React from 'react'
import {compose} from 'redux'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../../bit-components/icon-button/index'
import {Icons} from '../../bit-components/icon/index'
import {SelectionOnCopyCode} from '../../modules/featureStoreV2/graphqlAPIs/getFeatureGroups'
import {SelectionOnData as IFeature} from '../../modules/featureStoreV2/graphqlAPIs/getFeatures'
import {IFeatureGroupDetailsState} from '../../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import {aliasTokens} from '../../theme.contants'
import styles from './indexJSS'

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({theme}) => ({
  '& .MuiPaper-root': {
    border: 'none',
    background: aliasTokens.tertiary_background_color,
    borderRadius: '4px',
    marginTop: theme.spacing(1),
    maxWidth: '346px',
    color: aliasTokens.neutral_text_color,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
    '& .MuiMenu-list': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column'
    },
    '& .MuiMenuItem-root': {
      padding: '8px',
      display: 'inline-block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',

      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5)
      },
      '&:active': {
        backgroundColor: aliasTokens.secondary_background_color,
        borderRadius: '4px'
      },
      '&:hover': {
        backgroundColor: aliasTokens.secondary_background_color,
        borderRadius: '4px'
      }
    }
  }
}))

interface IProps extends WithStyles<typeof styles> {
  copyCodes: SelectionOnCopyCode[]
  selectedFeatures: IFeatureGroupDetailsState['selectedFeatures']
  setSelectedFeatures: (
    data: IFeatureGroupDetailsState['selectedFeatures']
  ) => any
  handleCopy: (copyCode: string) => void
}

function MultiCopyCodeButton(props: IProps) {
  const {
    selectedFeatures,
    classes,
    setSelectedFeatures,
    copyCodes = [],
    handleCopy
  } = props
  const [copySetList, setCopySetList] = React.useState<string[]>([])
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (copyCode: string) => {
    setAnchorEl(null)
    if (copyCode) navigator.clipboard.writeText(copyCode)
  }

  const handleDelete = (selectedIndex: number) => {
    let newSelected: readonly IFeature[] = []

    if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedFeatures.slice(1))
    } else if (selectedIndex === selectedFeatures.length - 1) {
      newSelected = newSelected.concat(selectedFeatures.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedFeatures.slice(0, selectedIndex),
        selectedFeatures.slice(selectedIndex + 1)
      )
    }

    setSelectedFeatures([...newSelected])
  }

  React.useEffect(() => {
    const copySetMap = {}
    selectedFeatures.forEach((feature) => {
      feature.copyCode.map((copyCodeData) => {
        if (!copySetMap[copyCodeData.name]) copySetMap[copyCodeData.name] = 0
        copySetMap[copyCodeData.name] = copySetMap[copyCodeData.name] + 1
      })
    })
    let highNum = 0
    const commonSet: string[] = []
    Object.keys(copySetMap).forEach((copySetMapKey) => {
      if (copySetMap[copySetMapKey] >= highNum)
        highNum = copySetMap[copySetMapKey]
    })
    Object.keys(copySetMap).forEach((copySetMapKey) => {
      if (copySetMap[copySetMapKey] === highNum) commonSet.push(copySetMapKey)
    })
    setCopySetList(commonSet)
  }, [selectedFeatures])

  return (
    <>
      <Button
        id='demo-customized-button'
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        variant='contained'
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          backgroundColor: '#0074E8',
          color: aliasTokens.primary_text_color,
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '14px',
          lineHeight: '20px',
          height: '40px',
          marginLeft: '12px'
        }}
      >
        <span className={`${Icons.ICON_COPY} ${classes.copySpanIcon}`}></span>
        Copy Code
        {selectedFeatures.length > 0 && (
          <span className={classes.selectedFeaturesCount}>
            {selectedFeatures.length}
          </span>
        )}
      </Button>
      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {selectedFeatures.length > 0 ? (
          <div className={classes.copyCodeContainer}>
            <div className={classes.selectedRow}>
              <span className={classes.text}>
                Selected: {selectedFeatures.length}
              </span>
              <span
                onClick={() => setSelectedFeatures([])}
                className={classes.blueText}
              >
                Clear all
              </span>
            </div>
            <div className={classes.listContainer}>
              {selectedFeatures.map((feature, idx) => (
                <div className={classes.listItem} key={feature.title}>
                  <div className={classes.title}>{feature.title}</div>
                  <div className={classes.delete}>
                    <IconButton
                      onClick={() => handleDelete(idx)}
                      leadingIcon={Icons.ICON_DELETE_OUTLINE}
                      actionableVariants={
                        ActionableIconButtonVariants.ACTIONABLE_PRIMARY
                      }
                      size={IconButtonSizes.LARGE}
                      actionable={true}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={classes.copySetContainer}>
              {copySetList.map((copySetItem) => (
                <div
                  onClick={() => handleCopy(copySetItem)}
                  key={copySetItem}
                  className={classes.copytSetItem}
                >
                  <div className={Icons.ICON_COPY}></div>
                  <div className={classes.copySetText}>
                    copy as {copySetItem}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{padding: '4px', display: 'flex', flexDirection: 'column'}}
          >
            {copyCodes.map((copyCode) => (
              <MenuItem
                key={copyCode.name}
                onClick={() => handleClose(copyCode.value)}
                disableRipple
              >
                <span
                  style={{marginRight: '11px'}}
                  className={Icons.ICON_COPY}
                />
                Copy as {copyCode.name}
              </MenuItem>
            ))}
          </div>
        )}
      </StyledMenu>
    </>
  )
}

const styleComponent = compose(withStyles(styles, {withTheme: true}))(
  MultiCopyCodeButton
)

export default styleComponent
