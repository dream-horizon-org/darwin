import {Button as MaterialButton} from '@mui/material'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {LoaderSize, ProgressCircle} from '../progress-circle/index'
import {Tooltip, ToolTipPlacement} from '../tooltip/index'
import {
  ActionableIconButtonSizes,
  ActionableIconButtonVariants,
  IconButtonSizes,
  IconButtonVariants
} from './constants'
import {iconButtonDarkThemeStyles} from './styles/darkThemeStyles'
import {iconButtonLightThemeStyles} from './styles/lightThemeStyles'

export type IconButtonProps = {
  /**
   * onClick function to be provided.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * Need to be provied to render icon .
   */
  leadingIcon: Icons
  /**
   * Need to be provied to change compoenent size .
   */
  size?: IconButtonSizes
  /**
   * Need to be provied to change compoenent variant .
   */
  variant?: IconButtonVariants
  /**
   * For selecting a new variant , which has its own sub variants.
   */
  actionable?: boolean
  /**
   * For defining the selected state, of the button (only works when the actionable is true)
   */
  isSelected?: boolean
  /**
   * For providing sub variants for actionableButton (only works when the actionable is true)
   */
  actionableVariants?: ActionableIconButtonVariants
  /**
   * For providing different variants for actionableButton (only works when the actionable is true)
   */
  actionableSizes?: ActionableIconButtonSizes
  /**
   * To provide test Id to icon button
   */
  dataTestId?: string
  /**
   * To Provide loading state in icon
   */
  isLoading?: boolean
  /**
   * To change theme
   */
  theme?: string
  /**
   * To Provide tooltip
   */
  showToolTip?: boolean
  /**
   * To Provide tooltip Text
   */
  toolTipText?: string
  /**
   * To Provide tooltip position
   */
  toolTipPlacement?: ToolTipPlacement
  /**
   * Disable Tooltip on hover
   */
  disabletoolTipHoverListener?: boolean
  /**
   * to detect buttons active and deactivated state
   */
  isActive?: boolean
}

// eslint-disable-next-line complexity
export const IconButton = ({
  onClick,
  size,
  disabled,
  variant,
  leadingIcon,
  actionable,
  isSelected,
  actionableVariants,
  actionableSizes,
  dataTestId,
  isLoading,
  showToolTip,
  toolTipText,
  toolTipPlacement,
  disabletoolTipHoverListener,
  isActive
}: IconButtonProps) => {
  const {theme} = useBitThemeContext()
  return (
    <>
      {showToolTip ? (
        <Tooltip
          placement={toolTipPlacement}
          title={toolTipText ?? 'Text'}
          disableHoverListener={disabletoolTipHoverListener}
          theme={theme}
        >
          <MaterialButton
            data-testid={dataTestId}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isLoading && onClick) onClick(e)
            }}
            disabled={disabled}
            startIcon={
              !isLoading &&
              leadingIcon && (
                <span
                  data-testid={'leading-icon'}
                  className={`icon ${leadingIcon} ${!actionable && size} ${
                    actionable && actionableSizes
                  }`}
                ></span>
              )
            }
            className={`${!actionable && size} ${
              actionable && actionableSizes
            } ${!actionable && variant} ${actionable && actionableVariants} ${
              disabled ? 'disabled' : null
            } ${actionable ? 'actionable' : ''} ${
              isSelected ? 'selected' : ''
            } ${isActive ? 'activebutton' : ''}`}
            sx={
              theme === 'dark'
                ? iconButtonDarkThemeStyles
                : iconButtonLightThemeStyles
            }
          >
            {isLoading ? (
              <ProgressCircle
                theme={theme}
                size={LoaderSize.Small}
                data-testid={'loadingIcon'}
              />
            ) : null}
          </MaterialButton>
        </Tooltip>
      ) : (
        <MaterialButton
          data-testid={dataTestId}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (!isLoading && onClick) onClick(e)
          }}
          disabled={disabled}
          startIcon={
            !isLoading &&
            leadingIcon && (
              <span
                data-testid={'leading-icon'}
                className={`icon ${leadingIcon} ${!actionable && size} ${
                  actionable && actionableSizes
                }`}
              ></span>
            )
          }
          className={`${!actionable && size} ${actionable && actionableSizes} ${
            !actionable && variant
          } ${actionable && actionableVariants} ${
            disabled ? 'disabled' : null
          } ${actionable ? 'actionable' : ''} ${isSelected ? 'selected' : ''} ${
            isActive ? 'activebutton' : ''
          }`}
          sx={
            theme === 'dark'
              ? iconButtonDarkThemeStyles
              : iconButtonLightThemeStyles
          }
        >
          {isLoading ? (
            <ProgressCircle
              theme={theme}
              size={LoaderSize.Small}
              data-testid={'loadingIcon'}
            />
          ) : null}
        </MaterialButton>
      )}
    </>
  )
}

IconButton.defaultProps = {
  size: IconButtonSizes.LARGE,
  variant: IconButtonVariants.PRIMARY,
  actionableVariants: ActionableIconButtonVariants.ACTIONABLE_PRIMARY,
  actionableSizes: ActionableIconButtonSizes.LARGE,
  theme: 'dark'
}
