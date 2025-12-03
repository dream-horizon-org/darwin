import {createUseStyles} from 'react-jss'
import {shell_loading as shell_loadingTheme} from '../../design-tokens/index'

const stylesDarkTheme = () => {
  // eslint-disable-next-line
  const shell_loading = shell_loadingTheme('dark')
  return createUseStyles({
    mainContainer: {
      width: '100%',
      height: '100%',
      '& .MuiSkeleton-root': {
        transform: 'scale(1)'
      }
    },
    container: {
      background:
        shell_loading.shell_loading.ds_shell_loading_background_color.replace(
          '_',
          '-'
        ),
      borderRadius: `${shell_loading.ds_shell_loading_radius}px`
    }
  })
}
export default stylesDarkTheme
