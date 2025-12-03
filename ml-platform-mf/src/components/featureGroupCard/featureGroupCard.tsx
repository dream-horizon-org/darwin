import CloseIcon from '@material-ui/icons/Close'
import {
  Button,
  FormControl,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent
} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import config from 'config'
import React, {useState} from 'react'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {Chip} from '../../bit-components/chip/index'
import {Icons} from '../../bit-components/icon/index'
import {ToolTipPlacement} from '../../bit-components/tooltip/index'
import Info from '../../components/Info'
import {routes} from '../../constants'
import {RunStatus} from '../../gql-enums/run-status.enum'
import {SelectionOnData as FeatureGroup} from '../../modules/featureStoreV2/graphqlAPIs/getFeatureGroups'
import {featureGroupTypes} from '../../modules/featureStoreV2/pages/featureStoreGroupDetails/constants'
import {aliasTokens} from '../../theme.contants'
import {featureFlags} from '../../utils/featureFlags'
import {getFormattedDateTimeForCompute} from '../../utils/getDateString'
import CopyCodeButton from '../copyCodeButton/copyCodeButton'
import styles from './featureGroupCardJSS'

interface FeatureGroupCardProp extends WithStyles<typeof styles> {
  featureGroup: FeatureGroup
}

const FeatureGroupCard = (props: FeatureGroupCardProp) => {
  const {classes, featureGroup} = props
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null)
  const [selectedVersion, setSelectedVersion] = useState(featureGroup.version)
  const handleVersionChange = (event: SelectChangeEvent<number>) => {
    setSelectedVersion(Number(event.target.value))
  }

  const history = useHistory()

  const openFeaureGroupDetails = () => {
    history.push(
      routes.feature
        .replaceAll(':id', featureGroup.title)
        .replaceAll(':version', `${selectedVersion}`)
        .replaceAll(':type', `${featureGroup.type}`)
        .replaceAll(':tab', '0')
    )
  }

  const openPopover = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const closePopover = () => {
    setAnchorEl(null)
  }
  const isPopoverOpen = Boolean(anchorEl)
  const id = open ? featureGroup.id : undefined

  return (
    <>
      <Popover
        id={id}
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            margin: '0px 8px',
            border: `1px solid ${aliasTokens.tertiary_background_color}`,
            boxShadow: '0px 4px 50px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px'
          }
        }}
        sx={{}}
      >
        <div className={classes.popoverContainer}>
          <div className={classes.popoverActions}>
            <div data-testid='feature-group-card-view-details-button'>
              <Button
                onClick={openFeaureGroupDetails}
                variant={'outlined'}
                sx={{
                  height: '28px',
                  marginRight: '8px',
                  color: aliasTokens.cta_secondary_text_color,
                  borderColor: aliasTokens.cta_secondary_text_color,
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                View Details
              </Button>
            </div>
            <div data-testid='copy-code-dropdown-button'>
              <CopyCodeButton copyCodes={featureGroup.copyCode} />
            </div>
            <CloseIcon onClick={closePopover} className={classes.closeIcon} />
          </div>
          {featureGroup.type !== featureGroupTypes.online && (
            <div className={classes.runs}>
              <div className={classes.popoverTitle}>Last 5 Runs</div>
              <div>
                {featureGroup.lastFiveRuns.length
                  ? featureGroup.lastFiveRuns.map((run) => (
                      <span
                        className={
                          run === RunStatus.SUCCESS
                            ? `${Icons.ICON_CHECK_CIRCLE} ${classes.success}`
                            : `${Icons.ICON_REPORT_GMAILERRORRED} ${classes.failure}`
                        }
                      />
                    ))
                  : 'No runs yet!'}
              </div>
            </div>
          )}
          {featureGroup.tags.length ? (
            <div className={classes.tags}>
              <div className={classes.popoverTitle}>Tags</div>
              <div>
                {featureGroup.tags.map((tag) => (
                  <div className={classes.chipContainer}>
                    <Chip key={tag} label={tag} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Popover>
      <div
        className={`${classes.container} ${
          isPopoverOpen ? classes.activeCard : ''
        }`}
        aria-describedby={id}
        onClick={openPopover}
        data-testid='feature-group-card'
      >
        <div className={classes.row1}>
          <Link
            className={classes.title}
            to={`/store/${featureGroup.title}/${selectedVersion}/${featureGroup.type}/0`}
          >
            <div data-testid='feature-group-title'>{featureGroup.title}</div>
          </Link>
          <div className={classes.versions}>
            {featureGroup.allVersions.length === 1 ? (
              <div
                className={classes.singleVersion}
                data-testid='feature-group-version'
              >
                V{featureGroup.version}
              </div>
            ) : (
              <FormControl
                sx={{width: 55, height: 24, fontSize: '12px'}}
                size='small'
              >
                <Select
                  sx={{width: 55, height: 24, fontSize: '12px', padding: '0px'}}
                  labelId='version-select'
                  id='version-select'
                  value={selectedVersion}
                  onChange={handleVersionChange}
                >
                  {featureGroup.allVersions.map((v) => (
                    <MenuItem sx={{fontSize: '14px'}} key={`V${v}`} value={v}>
                      V{v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </div>
        <div className={classes.description}>{featureGroup.description}</div>
        <div className={classes.row3}>
          <Info
            msg='No. of features'
            placement={ToolTipPlacement.Top}
            options={{
              componentsProps: {
                popper: {
                  disablePortal: true
                }
              }
            }}
          >
            <div className={classes.featuresCount}>
              <img
                src={`${config.cfMsdAssetUrl}/icons/features-icon.svg`}
                alt='Features icon'
              />
              <span className={classes.usageText}>
                {featureGroup.featuresCount}
              </span>
            </div>
          </Info>
          {featureFlags.FEATURE_STORE.LIST_PAGE.USAGE && (
            <div className={classes.usage}>
              <div className={classes.usageMetrix}>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/dev-usage-icon.svg`}
                  alt='Dev Usage Icon'
                />
                <span className={classes.usageText}>
                  {featureGroup.devUsage}
                </span>
              </div>
              <div className={classes.usageMetrix}>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/prod-usage-icon.svg`}
                  alt='Dev Usage Icon'
                />
                <span className={classes.usageText}>
                  {featureGroup.prodUsage}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className={classes.row4}>
          <img
            src={`${config.cfMsdAssetUrl}/icons/time-icon.svg`}
            alt='Dev Usage Icon'
            className={classes.time}
          />
          Last value updated:{' '}
          {getFormattedDateTimeForCompute(featureGroup.lastValueUpdated)}
        </div>
      </div>
    </>
  )
}

export default withStyles(styles, {withTheme: true})(FeatureGroupCard)
