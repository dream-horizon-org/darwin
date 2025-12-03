import {loader as loaderTheme} from '../../design-tokens/index'
export const stylesDarkTheme = () => {
  const loader = loaderTheme('dark')
  return {
    loaderSize: loader.ds_loader_circle_border_weight,
    '&.container': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    '&.backgroundLoader': {
      color:
        loader.loader.loader_circle.border.ds_loader_circle_base_border_color
    },
    '&.activeLoader': {
      color:
        loader.loader.loader_circle.border.ds_loader_circle_active_border_color,
      animationDuration: '1400ms',
      position: 'absolute',
      left: 0
    }
  }
}
