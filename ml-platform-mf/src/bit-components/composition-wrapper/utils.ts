import config from 'config'
import {Icons} from '../icon/index'
type ThemeList = Array<{value: 'light' | 'dark'; text: string; icon: string}>

export const themeToggleList: ThemeList = [
  {value: 'light', text: 'light', icon: Icons.ICON_WB_SUNNY},
  {value: 'dark', text: 'dark', icon: Icons.ICON_WB_CLOUDY}
]

export const iconMockFunc = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
  const link2 = document.createElement('link')
  link2.rel = 'stylesheet'
  link2.href =
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  head.appendChild(link2)
}

export enum TagsType {
  Default = 'default',
  Valid = 'valid',
  Invalid = 'invalid',
  Neutral = 'neutral',
  Header = 'header'
}

export enum TagsSizes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XS = 'xs'
}

export const TagsSizeList = [
  {value: TagsSizes.Medium, text: 'M'},
  {value: TagsSizes.Large, text: 'L'},

  {value: TagsSizes.Small, text: 'S'},
  {value: TagsSizes.XS, text: 'XS'}
]

export const TagsTypeList = [
  {value: TagsType.Default, text: 'Default'},
  {value: TagsType.Valid, text: 'Success'},
  {value: TagsType.Invalid, text: 'Error'},
  {value: TagsType.Neutral, text: 'Info'},
  {value: TagsType.Header, text: 'Warning'}
]
