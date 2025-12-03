import {createUseStyles} from 'react-jss'
import {globalToken} from '../design-tokens/index'
const styles = () => {
  return createUseStyles({
    wrapper: ({theme}) => ({
      background:
        theme === 'dark'
          ? globalToken.color.ds_global_color_neutral_110
          : globalToken.color.ds_global_color_white_10,
      height: '100vh',
      transition: 'all 0.5s linear',
      display: 'flex',
      padding: '20px',
      flexDirection: 'column',
      '& .MuiToggleButtonGroup-root': {
        '& .Mui-selected': {
          '& .icon:before': {color: 'white'}
        }
      }
    }),
    toggleGroup: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      '& .MuiToggleButtonGroup-root': {
        color: 'white',

        '& .Mui-selected': {
          color: 'white !important'
        }
      },
      '& .MuiTypography-root': {
        textTransform: 'capitalize',
        fontSize: '1rem',
        fontWeight: '700'
      }
    },
    toggleGroupWrapper: {
      paddingBottom: '10px',
      display: 'flex',
      gap: '1rem',
      flexDirection: 'column',
      alignItems: 'flex-end'
    }
  })
}
export default styles
