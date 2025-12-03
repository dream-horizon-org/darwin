import {createUseStyles} from 'react-jss'

export const tabCustomStyles = createUseStyles({
  consoleTabSection: {
    '& .MuiTabs-indicator': {
      display: 'flex'
    }
  },
  tabContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
})
