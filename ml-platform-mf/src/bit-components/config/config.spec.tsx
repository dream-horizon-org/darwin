import {aliasTokens, globalTokens} from './config'
it('should get global tokens', () => {
  expect(globalTokens.color_blue_10).toEqual('#E9F4FF')
})

it('should get alias tokens', () => {
  expect(aliasTokens.active_border_color).toEqual('#DADADA')
})
