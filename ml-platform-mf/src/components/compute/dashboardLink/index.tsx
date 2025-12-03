import LaunchIcon from '@mui/icons-material/Launch'
import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'

import {
  Tags,
  TagsSizes,
  TagsType
} from '../../../bit-components/tags/tags/index'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  logoLink: string
  disabledLogoLink?: string
  altText: string
  dashboardName: string
  link: string
  isActive?: boolean
  enableClick?: boolean
  onClick?: () => void
  dashboardStatus?: string
  subText?: string
}

const DashboardLink = (props: IProps) => {
  const {
    logoLink,
    disabledLogoLink,
    altText,
    dashboardName,
    link,
    classes,
    isActive = true,
    enableClick = false,
    onClick,
    dashboardStatus,
    subText
  } = props

  const onDashboardLinkClicked = () => {
    if (dashboardStatus) {
      if (dashboardStatus === 'active') {
        window.open(link, '_blank')
      } else if (dashboardStatus === 'failed') {
        onClick && onClick()
      }
    } else if (isActive) {
      window.open(link, '_blank')
    } else {
      onClick && onClick()
    }
  }

  const getDashboardStatus = () => {
    switch (dashboardStatus) {
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      case 'creating':
        return 'Starting...'
      case 'created':
        return 'Starting...'
      case 'failed':
        return 'Failed'
      default:
        return 'Inactive'
    }
  }

  const getDashboardTagType = () => {
    switch (dashboardStatus) {
      case 'active':
        return TagsType.Valid
      case 'inactive':
        return TagsType.Invalid
      case 'creating':
        return TagsType.Default
      case 'created':
        return TagsType.Default
      default:
        return TagsType.Invalid
    }
  }

  return (
    <div className={classes.container} onClick={onDashboardLinkClicked}>
      <div className={classes.top}>
        <div className={classes.left}>
          <img
            src={isActive ? logoLink : disabledLogoLink}
            alt={altText}
            className={classes.dashboardIcon}
          />
          <div
            className={`${classes.titleContainer} ${
              enableClick ? classes.titleContainerWithMargin : ''
            }`}
          >
            <h5
              className={`${classes.dashboardTitle} ${
                !isActive ? classes.inActiveTitle : ''
              } ${enableClick ? classes.dashboardWithTitle : ''}`}
            >
              {dashboardName}
              {dashboardStatus && (
                <span className={classes.dashboardStatus}>
                  <Tags
                    label={getDashboardStatus()}
                    type={getDashboardTagType()}
                    size={TagsSizes.Small}
                  />
                </span>
              )}
            </h5>
            {enableClick && <p className={classes.launchBtn}>{subText}</p>}
          </div>
        </div>
        <div className={classes.right}>
          <LaunchIcon
            className={`${classes.icon} ${
              !isActive ? classes.inActiveIcon : ''
            }`}
          />
        </div>
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(DashboardLink)

export default styleComponent
