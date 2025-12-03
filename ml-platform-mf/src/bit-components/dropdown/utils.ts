export const mockAvatarLInk =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&w=1000&q=80'

export type MenuList = Array<object> | Array<string> | Array<number>

export const transformMenuList = (menu: MenuList) => {
  return menu.map((option, index) =>
    option.label ? option : {label: option.toString(), id: index + 1}
  )
}
