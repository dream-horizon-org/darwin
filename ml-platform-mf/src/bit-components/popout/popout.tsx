import Popover, {PopoverReference} from '@mui/material/Popover'
import React, {ReactNode} from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Chip, ChipSizes} from '../chip/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes
} from '../icon-button/index'
import {Icons} from '../icon/index'
import {PopoutHorizontalPositions, PopoutVerticalPositions} from './constants'
import {useStyles} from './styles/commonStyles'
import {PopoutDarkThemeStyle} from './styles/darkThemeStyles'
import {PopoutLightThemeStyle} from './styles/lightThemeStyles'
export interface PopoutInput {
  label: string
}

export interface PopoutPositionInput {
  vertical: PopoutVerticalPositions | number
  horizontal: PopoutHorizontalPositions | number
}
export interface AnchorPositionInput {
  top: number
  left: number
}

export type PopoutProps = {
  /**
   * a node to be rendered in the special component.
   */
  anchorEl?: HTMLButtonElement | Element | null
  /**
   * A function for closing the popout box.
   */
  handleClose: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * A function for closing the popout box.
   */
  optionsList?: PopoutInput[]
  /**
   * A config for assigning the popout box position.
   */
  anchorOrigin?: PopoutPositionInput
  /**
   * A config for assigning the popout box transform origin.
   */
  transformOrigin?: PopoutPositionInput
  /**
   * To change theme
   */
  theme?: string
  /**
   * a node to be rendered in the special component.
   */
  children?: ReactNode
  /**
   * To show children
   */
  showChildren?: boolean
  /**
   * To open popout
   */
  open?: boolean
  /**
   * To change anchor reference
   */
  anchorReference?: PopoverReference
  /**
   * To change anchor position
   */
  anchorPosition?: AnchorPositionInput
  /**
   * To show on close button
   */

  showOnCloseButton?: boolean
  /**
   *  On mouse enter event
   */
  onMouseEnter?: (e) => void
  /**
   * On mouse leave event
   */
  onMouseLeave?: (e) => void
}

export function Popout(props: PopoutProps) {
  const {
    anchorEl,
    handleClose,
    optionsList,
    anchorOrigin,
    transformOrigin,
    children,
    showChildren,
    anchorReference,
    anchorPosition,
    open,
    showOnCloseButton,
    onMouseEnter,
    onMouseLeave
  } = props

  const darkClasses = PopoutDarkThemeStyle()
  const lightClasses = PopoutLightThemeStyle()
  const {theme} = useBitThemeContext()
  const classes = theme === 'dark' ? darkClasses : lightClasses
  const classesForHover = useStyles()

  return (
    <div>
      {anchorReference && open && (
        <Popover
          classes={{paper: classesForHover.popoverContent}}
          PaperProps={{
            onMouseEnter: onMouseEnter,
            onMouseLeave: onMouseLeave
          }}
          className={`${classes.popOver} ${classesForHover.popover}`}
          open={open}
          anchorReference={anchorReference}
          anchorPosition={anchorPosition}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          onClose={handleClose}
        >
          <div className={`${classes.popOverContainer}`}>
            <div
              data-testid={'popout-content'}
              className={`${classes.groupsSurface}`}
            >
              {!showChildren &&
                optionsList?.map((data, index) => {
                  return (
                    <div key={index}>
                      <Chip
                        label={data?.label || ''}
                        theme={theme}
                        size={ChipSizes.Small}
                      />
                    </div>
                  )
                })}

              {showChildren && children}
            </div>
            {showOnCloseButton && (
              <div
                data-testid={'close-icon'}
                className={`${classes.closeButton}`}
              >
                <IconButton
                  leadingIcon={Icons.ICON_CLOSE}
                  onClick={handleClose}
                  actionableVariants={
                    ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                  }
                  size={IconButtonSizes.SMALL}
                  actionable={true}
                  theme={theme}
                />
              </div>
            )}
          </div>
        </Popover>
      )}

      {anchorEl && (
        <Popover
          classes={{paper: classesForHover.popoverContent}}
          PaperProps={{
            onMouseEnter: onMouseEnter,
            onMouseLeave: onMouseLeave
          }}
          className={`${classes.popOver} ${classesForHover.popover}`}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          onClose={handleClose}
        >
          <div className={`${classes.popOverContainer}`}>
            <div
              data-testid={'popout-content'}
              className={`${classes.groupsSurface}`}
            >
              {!showChildren &&
                optionsList?.map((data, index) => {
                  return (
                    <div key={index}>
                      <Chip
                        label={data?.label || ''}
                        theme={theme}
                        size={ChipSizes.Small}
                      />
                    </div>
                  )
                })}

              {showChildren && children}
            </div>
            {showOnCloseButton && (
              <div
                data-testid={'close-icon'}
                className={`${classes.closeButton}`}
              >
                <IconButton
                  leadingIcon={Icons.ICON_CLOSE}
                  onClick={handleClose}
                  actionableVariants={
                    ActionableIconButtonVariants.ACTIONABLE_SECONDARY
                  }
                  size={IconButtonSizes.SMALL}
                  actionable={true}
                  theme={theme}
                />
              </div>
            )}
          </div>
        </Popover>
      )}
    </div>
  )
}

Popout.defaultProps = {
  theme: 'dark',
  anchorOrigin: {
    vertical: PopoutVerticalPositions.BOTTOM,
    horizontal: PopoutHorizontalPositions.LEFT
  },
  transformOrigin: {
    vertical: PopoutVerticalPositions.TOP,
    horizontal: PopoutHorizontalPositions.LEFT
  }
}
