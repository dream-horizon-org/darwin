import {createUseStyles} from 'react-jss'
import {surface as surfaceTheme} from '../../design-tokens/index'

export const stylesDarkTheme = () => {
  const surface = surfaceTheme('dark')
  return createUseStyles({
    surfaceProps: (props: {borderRadius; padding}) => ({
      borderRadius: props.borderRadius + 'px',
      padding: props.padding + 'px'
    }),
    banner: {
      width: '100%',
      height: '100%',
      '&.tertiary': {
        background: surface.surface.ds_surface_tertiary_background_color
      },
      '&.primary': {
        background: surface.surface.ds_surface_primary_background_color
      },
      '&.secondary': {
        background: surface.surface.ds_surface_secondary_background_color
      },
      '&.overlay': {
        background: surface.surface.ds_surface_overlay_background_color,
        opacity: surface.ds_surface_overlay_opacity,
        backdropFilter: `blur(${surface.blur.ds_surface_overlay_blur}px)`
      }
    },
    consoleVariant: {
      height: 'fit-content'
    }
  })
}
