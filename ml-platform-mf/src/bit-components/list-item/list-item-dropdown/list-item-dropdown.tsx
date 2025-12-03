import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import React, {ReactNode, useEffect, useState} from 'react'
import {Avatar, AvatarSizes, AvatarVariants} from '../../avatar/index'
import {useBitThemeContext} from '../../bit-theme-wrapper/index'
import {Checkbox} from '../../checkbox/index'
import {Icons} from '../../icon/index'
import {IconPosition} from './constants'
import {listItemDropdownDarkThemeStyle} from './styles/darkThemeStyles'
import {listItemDropdownLightThemeStyle} from './styles/lightThemeStyles'
export type ListItemDropdownProps = {
  /**
   * text to be rendered
   */
  text: string
  /**
   * secondaryText to be rendered
   */
  secondaryText?: string
  /**
   * onClick funtion passed to the component
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  /**
   * to render icon
   */
  icon?: Icons
  /**
   * to give the position where icon needs to be rendered
   */
  iconPosition?: IconPosition
  /**
   * used to identyfy if the element is selected or not
   */
  isSelected?: boolean
  /**
   * to pass test identifier
   */
  testIdentifier?: string
  /**
   * to pass a unique key
   */
  key?: string
  /**
   * for passing a unique id
   */
  id?: string
  /**
   * to render avatar instead of icon
   */
  avatarSrc?: string
  /**
   * to render avatar text instead of icon
   */
  avatarText?: string
  /**
   * to change theme
   */
  theme?: string
  /**
   * to render checkbox on left
   */
  renderCheckBox?: boolean
  /**
   * state of the rendered checkbox
   */
  isSelectedCheckBox?: boolean
  /**
   * to set option with no access permission
   */
  hasPermission?: boolean
  /**
   * to set option with specific
   */
  tertiaryText?: string
  /**
   * to pass JSX
   */
  children?: React.ReactElement<any, any> & ReactNode
}
const RenderIcon = ({
  isLeftPosition = true,
  ...props
}: {
  isLeftPosition: boolean
  avatarSrc?: string

  avatarText?: string

  theme?: string
  icon?: Icons
}): JSX.Element => {
  const classIcon = isLeftPosition ? 'leftIcon' : 'rightIcon'
  return (
    <>
      {props.icon || props.avatarSrc || props.avatarText ? (
        props.avatarSrc || props.avatarText ? (
          <div className={classIcon}>
            <Avatar
              src={props.avatarSrc}
              size={AvatarSizes.LARGE}
              text={props.avatarText}
              variant={props.avatarText ? AvatarVariants.INITIALS : undefined}
              theme={props.theme}
            />
          </div>
        ) : (
          <ListItemIcon className={`primaryIcon ${classIcon}`}>
            <span data-testid='icon' className={`icon ${props.icon}`}></span>
          </ListItemIcon>
        )
      ) : (
        ''
      )}
    </>
  )
}
export function ListItemDropdown(props: ListItemDropdownProps) {
  const [checked, setChecked] = useState(props.isSelectedCheckBox)
  const {theme} = useBitThemeContext()

  useEffect(() => {
    setChecked(props.isSelectedCheckBox)
  }, [props?.isSelectedCheckBox])

  return (
    <ListItemButton
      id={props.id}
      key={props.key}
      selected={props.isSelected}
      className={`container ${props.isSelected ? 'selected' : ''} ${
        props.icon && props.iconPosition === IconPosition.RIGHT
          ? 'withRightIcon'
          : ''
      }`}
      data-test={props.testIdentifier}
      data-testid={props.testIdentifier}
      sx={
        theme === 'dark'
          ? listItemDropdownDarkThemeStyle
          : listItemDropdownLightThemeStyle
      }
      onClick={(e) => {
        setChecked(!checked)
        if (props.onClick) props.onClick(e)
      }}
    >
      {props.iconPosition === IconPosition.LEFT &&
        (props.renderCheckBox ? (
          <Checkbox checked={checked} />
        ) : (
          <RenderIcon
            isLeftPosition={true}
            icon={props?.icon}
            avatarSrc={props?.avatarSrc}
            avatarText={props?.avatarText}
          />
        ))}
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

      {props.iconPosition === IconPosition.RIGHT && (
        <RenderIcon
          isLeftPosition={false}
          icon={props?.icon}
          avatarSrc={props?.avatarSrc}
          avatarText={props?.avatarText}
        />
      )}
      {props.children ? props.children : null}
    </ListItemButton>
  )
}

ListItemDropdown.defaultProps = {
  iconPosition: IconPosition.RIGHT,
  hasPermission: true,
  theme: 'dark'
}
