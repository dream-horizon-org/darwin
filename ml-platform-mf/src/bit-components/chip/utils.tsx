import {ChipIcons} from './constants'

export const getClassName = (leadingIcon, onDelete) => {
  if (leadingIcon && onDelete) return ChipIcons.LeadingAndTrailingIcon
  else if (onDelete) return ChipIcons.TrailingIcon
  else if (leadingIcon) return ChipIcons.LeadingIcon
  else return ChipIcons.WithoutIcon
}
export const mockAvatarLInk =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'
