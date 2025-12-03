import {Avatar as MaterialAvatar} from '@mui/material'
import Badge from '@mui/material/Badge'
import React from 'react'
import {useBitThemeContext} from '../bit-theme-wrapper/index'
import {Icons} from '../icon/index'
import {Tooltip, ToolTipPlacement} from '../tooltip/index'
import Config from './config'
import {AvatarSizes, AvatarVariants, TagType} from './constants'
import {Player, PlayerLight} from './iconComponents/Player'
import {Team, TeamLight} from './iconComponents/Team'
import {stylesDarkThemeAvatar} from './styles/darkThemeStyles'
import {stylesLightThemeAvatar} from './styles/lightThemeStyles'

export type AvatarProps = {
  /**
   * If true tag will appear.
   */

  tag?: boolean
  /**
   * Image to be rendered.
   */

  src?: string
  /**
   * To rendered captain or vice-captain icon.
   */
  tagType?: TagType

  /**
   * Icon placed in the tag.
   */
  tagIcon?: Icons

  /**
   * To change the size of the component.
   */
  size?: AvatarSizes
  /**
   * To change the variant of the component.
   */
  variant?: AvatarVariants
  /**
   * To change the text of the component.
   */
  text?: string
  /**
   * To change theme.
   */
  theme?: string
}

function stringToColor(str: string) {
  let hash = 0
  let i

  for (i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }

  return color
}

export function Avatar({
  size,
  tag,
  tagType,
  tagIcon,
  src,
  variant,
  text
}: AvatarProps) {
  const {theme} = useBitThemeContext()
  const getAvatarStyles = () => {
    return theme === 'light' ? stylesLightThemeAvatar : stylesDarkThemeAvatar
  }
  function stringAvatar(name: string) {
    return {
      sx: {
        ...getAvatarStyles(),
        background: `${stringToColor(name)} !important`
      },
      children: `${name.split(' ')?.[0]?.[0] || ''}${
        name.split(' ')?.[1]?.[0] || ''
      }`
    }
  }

  function InitialsAvatar() {
    return (
      <Tooltip title={text ?? ''} placement={ToolTipPlacement.Top}>
        <MaterialAvatar
          data-testid='basic-avatar'
          className={`${size} background`}
          src={src}
          {...stringAvatar(text ?? '')}
        />
      </Tooltip>
    )
  }

  return (
    <>
      {variant === AvatarVariants.INITIALS ? (
        <InitialsAvatar />
      ) : tag ? (
        <Badge
          data-testid='basic-avatar'
          overlap='circular'
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          badgeContent={
            tagType ? (
              <MaterialAvatar className={`tag_${size}`} sx={getAvatarStyles()}>
                <Config tagType={tagType}></Config>
              </MaterialAvatar>
            ) : (
              <MaterialAvatar className={`tag_${size}`} sx={getAvatarStyles()}>
                <span className={`icon ${tagIcon} tag_icon_${size}`}></span>
              </MaterialAvatar>
            )
          }
        >
          <MaterialAvatar
            src={src}
            className={`${size}`}
            sx={getAvatarStyles()}
          >
            {variant === AvatarVariants.PLAYER ? (
              <>{theme === 'dark' ? <Player /> : <PlayerLight />}</>
            ) : (
              <>{theme === 'dark' ? <Team /> : <TeamLight />}</>
            )}
          </MaterialAvatar>
        </Badge>
      ) : (
        <MaterialAvatar
          data-testid='basic-avatar'
          className={`${size}`}
          sx={getAvatarStyles()}
          src={src}
        >
          {variant === AvatarVariants.PLAYER ? (
            <>{theme === 'dark' ? <Player /> : <PlayerLight />}</>
          ) : (
            <>{theme === 'dark' ? <Team /> : <TeamLight />}</>
          )}
        </MaterialAvatar>
      )}
    </>
  )
}

Avatar.defaultProps = {
  size: AvatarSizes.LARGE,
  theme: 'dark'
}
