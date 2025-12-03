import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import React, {ReactNode} from 'react'
import {Avatar, AvatarSizes, AvatarVariants} from '../../avatar/index'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Button, ButtonSizes, ButtonVariants} from '../../button/index'
import {Icons} from '../../icon/index'
import {ListItemSizes} from './constants'
import {listItemDarkThemeStyle} from './styles/darkThemeStyles'
import {listItemLightThemeStyle} from './styles/lightThemeStyles'

export type ListItemProps = {
  /**
   * text to be rendered
   */
  text?: string
  /**
   * to pass test identifier
   */
  testIdentifier?: string
  /**
   * to pass a unique key
   */
  key?: string
  /**
   * if true , then component is disable
   */
  disabled?: boolean
  /**
   * if true , then component is in selected state
   */
  isSelected?: boolean
  size?: ListItemSizes
  /**
   * To change theme
   */
  theme?: string
  /**
   * secondaryText to be rendered
   */
  secondaryText?: string
  /**
   * to set option with no access permission
   */
  hasPermission?: boolean
  /**
   * to set option with specific
   */
  tertiaryText?: string
  /**
   * to render avatar instead of icon
   */
  avatarSrc?: string
  /**
   * to render avatar text instead of icon
   */
  avatarText?: string
  /**
   * to render button
   */
  buttonText?: string
  /**
   * onclick function
   */
  onClick?: any
  /**
   * to render icon
   */
  icon?: Icons
  /**
   * to pass JSX
   */
  children?: ReactNode
}

export function ListItem(props: ListItemProps) {
  const {theme} = useBitThemeContext()
  const renderIconComp = () => {
    return (
      <ListItemIcon className={`primaryIcon `}>
        <span data-testid='icon' className={`icon ${props.icon}`}></span>
      </ListItemIcon>
    )
  }

  const renderAvatarComp = () => {
    return (
      <Avatar
        src={props.avatarSrc}
        size={AvatarSizes.SMALL}
        text={props.avatarText}
        variant={props.avatarText ? AvatarVariants.INITIALS : undefined}
        theme={props.theme}
      />
    )
  }
  const renderListContentComponent = () => {
    return (
      <>
        {(props.icon && renderIconComp) ||
          ((props.avatarSrc || props.avatarText) && renderAvatarComp())}

        <div className='textDiv'>
          <div className='primaryTextContainer'>
            <ListItemText
              className={`primaryText ${props.secondaryText ? 'bold' : ''}`}
              primary={props.text}
            />
            {!props?.hasPermission && (
              <div className={`hasPermission`}>{props?.tertiaryText}</div>
            )}
          </div>
          {props.secondaryText && (
            <ListItemText
              className='secondaryText'
              primary={props.secondaryText}
            />
          )}
        </div>

        {props.buttonText && (
          <Button
            buttonText={props.buttonText}
            onClick={props.onClick}
            variant={ButtonVariants.TERTIARY}
            size={ButtonSizes.SMALL}
            theme={props.theme}
          />
        )}
      </>
    )
  }

  return (
    <ListItemButton
      key={props.key}
      className={`container ${
        props.size === ListItemSizes.MEDIUM ? 'medium' : ''
      }  ${props.isSelected ? 'selected' : ''} `}
      data-test={props.testIdentifier}
      data-testid={props.testIdentifier}
      sx={theme === 'dark' ? listItemDarkThemeStyle : listItemLightThemeStyle}
      disabled={props.disabled}
    >
      {props.children || renderListContentComponent()}
    </ListItemButton>
  )
}
ListItem.defaultProps = {
  theme: 'dark'
}
