import {Icons} from '../icon/index'
import {ChipIcons} from './constants'
import {getClassName} from './utils'

describe('type of chip with icon', () => {
  it('chip with leading icon', () => {
    const leadingIcon = Icons.ICON_HIGHLIGHT_OFF
    const onDelete = null
    const className = getClassName(leadingIcon, onDelete)
    expect(className).toBe(ChipIcons.LeadingIcon)
  })

  it('chip with leading and trailing icon', () => {
    const leadingIcon = Icons.ICON_HIGHLIGHT_OFF
    const onDelete = () => {
      return 'dummy function'
    }
    const className = getClassName(leadingIcon, onDelete)
    expect(className).toBe(ChipIcons.LeadingAndTrailingIcon)
  })

  it('chip with trailing icon', () => {
    const leadingIcon = null
    const onDelete = () => {
      return 'dummy function'
    }
    const className = getClassName(leadingIcon, onDelete)
    expect(className).toBe(ChipIcons.TrailingIcon)
  })

  it('chip without any icon', () => {
    const leadingIcon = null
    const onDelete = null
    const className = getClassName(leadingIcon, onDelete)
    expect(className).toBe(ChipIcons.WithoutIcon)
  })
})
