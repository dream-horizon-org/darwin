import {ButtonVisibility} from './constants'
import {getButtonClass} from './utils'

describe('Test to check when to add the button option on Banner', () => {
  it('Button when text is send', () => {
    const ButtonClass = getButtonClass('Dummy String')
    expect(ButtonClass).toBe(ButtonVisibility.ShowButton)
  })
  it('Button when text is not send', () => {
    const buttonText = null
    const ButtonClass = getButtonClass(buttonText)
    expect(ButtonClass).toBe(ButtonVisibility.HideButton)
  })
})
