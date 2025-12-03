import {popout as popoutTheme} from '../design-tokens/index'
import {hexToRGB} from './utils'

describe('popout', () => {
  describe('should check hex to rgba converter', () => {
    it('test hex to rgba converter', () => {
      const popout = popoutTheme('dark')
      const hexColorCode = hexToRGB(
        popout.popout.background.ds_popout_background_color,
        popout.ds_popout_background_opacity
      )
      expect(hexColorCode).toEqual('rgba(26, 26, 26, 0.5)')
    })
  })
})
