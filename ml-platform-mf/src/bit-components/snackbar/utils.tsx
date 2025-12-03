import {ButtonVisibility} from './constants'
export const getButtonClass = (buttonText) => {
  return buttonText ? ButtonVisibility.ShowButton : ButtonVisibility.HideButton
}
