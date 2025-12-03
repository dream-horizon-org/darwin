import MUIChip from '@mui/material/Chip'
import React from 'react'
import {Avatar, AvatarSizes, AvatarVariants} from '../avatar/index'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {ChipSizes} from './constants'
import {stylesDarkTheme} from './styles/darkThemeStyles'
import {stylesLightTheme} from './styles/lightThemeStyles'
import {getClassName} from './utils'

type ChipProps = {
  /**
   * label to show on chip
   */
  label: string
  /**
   * If true, the component is disabled.
   */
  disabled?: boolean
  /**
   * To change the size of the component.
   */
  size?: ChipSizes

  selected?: boolean
  /**
   * onClick function to be provided.
   */
  onClick?: () => void
  /**
   * onDelete function to be provided, it is neccesary to pass the callable function to show delete icon.
   */
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Icon placed before the text.
   */
  leadingIcon?: Icons
  /**
   * Icon placed after the text.
   */
  tarilingIcon?: Icons
  /**
   * to render avatar instead of icon
   */
  avatarSrc?: string
  /**
   * to render avatar text instead of icon
   */
  avatarText?: string
  /**
   * to change the size of avtar
   */
  avatarSize?: AvatarSizes
  /**
   * to change theme
   */
  theme?: string
}

export function Chip(props: ChipProps) {
  const {
    label,
    disabled,
    size,
    onClick,
    selected,
    onDelete,
    leadingIcon,
    tarilingIcon,
    avatarSrc,
    avatarText,
    avatarSize
  } = props

  const {theme} = useBitThemeContext()

  return (
    <MUIChip
      sx={theme === 'light' ? stylesLightTheme : stylesDarkTheme}
      className={`chip ${size} ${getClassName(leadingIcon, onDelete)}  ${
        selected && 'selectedFill'
      }`}
      label={label}
      disabled={disabled}
      size={size}
      onClick={onClick}
      onDelete={tarilingIcon ? onClick : onDelete}
      deleteIcon={
        tarilingIcon ? (
          <span className={`trailIcon ${tarilingIcon}  ${size}`}></span>
        ) : (
          <span
            className={`deleteIcon ${Icons.ICON_HIGHLIGHT_OFF}  ${size}`}
          ></span>
        )
      }
      avatar={
        avatarSrc || avatarText ? (
          <div className={'avatar'}>
            <Avatar
              theme={theme}
              text={avatarText}
              variant={avatarText ? AvatarVariants.INITIALS : undefined}
              src={avatarSrc}
              size={avatarSize ? avatarSize : AvatarSizes.MINI}
            />
          </div>
        ) : (
          leadingIcon && <span className={`icon ${leadingIcon} ${size}`}></span>
        )
      }
    />
  )
}

Chip.defaultProps = {
  size: ChipSizes.Medium,
  theme: 'dark'
}
