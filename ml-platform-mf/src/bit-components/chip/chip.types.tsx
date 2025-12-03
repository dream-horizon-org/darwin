import {AvatarSizes} from '../avatar/index'
import {Icons} from '../icon/index'
import {ChipSizes} from './constants'
export type ChipProps = {
  label: string
  disabled?: boolean
  size?: ChipSizes
  selected?: boolean
  onClick?: () => void
  onTrailingIconClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void
  leadingIcon?: Icons
  tarilingIcon?: Icons
  avatarSrc?: string
  avatarText?: string
  avatarSize?: AvatarSizes
  theme?: string
}
