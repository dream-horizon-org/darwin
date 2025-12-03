import {createStyles} from '@mui/styles'

const navLinkStyles = {
  maxWidth: '100%',
  minWidth: '136px',
  height: 'fit-content',
  display: 'flex',
  padding: '8px 16px 8px 8px',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '400',
  fontSize: '14px',
  color: '#D9D9D9',
  borderRadius: '4px'
}

const styles = createStyles({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: '-16px'
  },
  tabContainer: {
    width: 'fit-content',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRight: `1px solid #333333`,
    padding: '24px 24px 8px 24px',
    boxSizing: 'border-box',
    position: 'fixed'
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  title: {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: '20px',
    color: '#D9D9D9',
    margin: '0 0 24px 0'
  },
  navLink: {
    ...navLinkStyles,
    boxSizing: 'border-box',
    backgroundColor: 'transparent'
  },
  activeNavLink: {
    ...navLinkStyles,
    boxSizing: 'border-box',
    backgroundColor: '#022445'
  }
})

export default styles
