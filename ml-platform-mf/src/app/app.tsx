import {CssBaseline, Drawer} from '@mui/material'
import {StyledEngineProvider, Theme, ThemeProvider} from '@mui/material/styles'
import {withStyles} from '@mui/styles'
import config from 'config'
import React, {Component, lazy, Suspense} from 'react'
import {Helmet} from 'react-helmet'
import {connect, Provider} from 'react-redux'
import {withRouter} from 'react-router'
import {
  getAppContext,
  setActiveRoute,
  setMsdUserInfoDetails,
  setSnackBar
} from '../actions/commonActions'
import {setUserPermissions} from '../actions/loginActions'
import {BitThemeWrapper} from '../bit-components/bit-theme-wrapper/index'
import {MicroFeWindow} from '../bootstrap'
import AppHeader from '../components/appHeader/appHeader'
import AppSideNavbar from '../components/appSideNavbar/appSideNavbar'
import DialogContainer from '../components/dialogContainer'
import GlobalSnackbar from '../components/globalSnackbar'
import GlobalSpinner from '../components/globalSpinner'
import Spinner from '../components/spinner/spinner'
import CreateProjectDrawer from '../components/workspace/createProjectDrawer/createProjectDrawer'
import {accessibleTab, getActiveAppFromLocation} from '../modules/login/utils'
import MsdTheme from '../MsdTheme'
import {getMenu, setAppContext, sideNavState} from '../reducers/appDrawerDuck'
import {CommonState, IGlobalSnackBarConfig} from '../reducers/commonReducer'
import store from '../store'
// import {ThemeProvider} from '../theme/ThemeContext'
import {EventTypes, SeverityTypes} from '../types/events.types'
import {logEvent} from '../utils/events'
import {menu} from '../utils/menuConstants'
import styles from './appJss'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const SwitchRoute = lazy(() => import('../hoc/switchRoute/switchRoute'))
const SnackBarPortal = lazy(() => import('../components/snackBar/snackBar'))

const renderLoader = () => <Spinner show={true} />

interface ExtendedWindow extends Window {
  microEnv?: unknown
}

interface IProps {
  globalSnackBar: IGlobalSnackBarConfig
}

class AppContainer extends Component<IProps & any, any> {
  private unlisten: () => void
  private removeShortCutListen: any
  private accessToken: any
  private isHome: any
  private windowLocation: any
  private permissions: any
  private showSidebar: any
  private menuList: any
  private activeApp: any
  private _window: MicroFeWindow

  public static defaultProps = {
    setIsFileUploading: false
  }

  constructor(props: IProps & any) {
    super(props)
    try {
      this._window = window as Window
      const permissions = JSON.parse(localStorage.getItem('x-permissions'))
      this.accessToken = localStorage.getItem('x-access-token')
      this.state = {
        permissions: localStorage.getItem(permissions || []),
        isMicroEnv: this._window && this._window.microEnv,
        appDrawerToggle: true
      }
      this.props.setSideNavState(true)
      this.windowLocation = this.props.history.location
      this.permissions = JSON.parse(localStorage.getItem('x-permissions')) || []
      this.menuList = menu.mlplatform
      this.showSidebar = this.isSideNavVisible(
        this.menuList?.menus,
        permissions
      )
      this.activeApp = 'mlplatform'
    } catch (e) {}
  }

  public componentDidMount() {
    this.setPermissionsAndContext()
    // @ts-ignore
    this.unlisten = this.props.history.listen(() => {
      const location = this.props.history.location
      this.props.setActiveRoute(location.pathname)
      const appContext = getAppContext(location.pathname)
      if (appContext) {
        this.props.handleAppContextChange(getAppContext(location.pathname))
      }
    })
    this.removeShortCutListen = window.addEventListener(
      'keydown',
      this.keyPressHandle,
      false
    )

    logEvent(EventTypes.GENERIC.UI_OPEN, SeverityTypes.INFO)
  }

  public componentWillUnmount() {
    this.unlisten()
    this.removeShortCutListen && this.removeShortCutListen()
  }

  public componentDidUpdate(): void {
    if (this.props.showGlobalSpinner) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'initial'
    }
  }

  setPermissionsAndContext() {
    try {
      const token = localStorage.getItem('x-access-token')
      const permissions = JSON.parse(localStorage.getItem('x-permissions'))
      const userDetails = JSON.parse(localStorage.getItem('x-user-details'))
      if (userDetails) {
        this.props.setMsdUserInfoDetails(userDetails)
      }
      if (token && permissions) {
        if (permissions && permissions.length > 0) {
          this.props.saveUserPermissions(permissions)
        }
      }
    } catch (e) {}
  }

  isSideNavVisible(menuList = [], userPermissions) {
    for (let i = 0; i < menuList.length; i++) {
      if (accessibleTab(userPermissions, menuList[i].permission)) return true
    }
    return false
  }

  handleHamburgurHiddenState = () => {
    return (
      this.windowLocation.pathname.indexOf('/home') !== -1 ||
      this.windowLocation.pathname.indexOf('/msd/msd-access') !== -1
    )
  }

  keyPressHandle = (e: WindowEventMap['keydown']) => {
    if (e.metaKey && e.shiftKey && e.key === 'k') {
      e.preventDefault()
      this.props.openCommandPanel(!this.props.isCommandPanelOpen, 1)
      return
    }
    if (e.metaKey && e.key === 'k') {
      e.preventDefault()
      this.props.openCommandPanel(!this.props.isCommandPanelOpen)
      return
    }
    if (e.key === 'Escape') {
      this.props.openCommandPanel(false)
      return
    }
  }
  onCloseCommandPanel = () => {
    this.props.openCommandPanel(false)
  }

  public closeSnackBar = () => {
    this.props.closeSnackbar(true)
  }

  handleAppDrawerOpen = () => {
    this.setState({
      ...this.state,
      appDrawerToggle: false
    })
    this.props.setSideNavState(false)
  }

  handleAppDrawerClose = () => {
    this.setState({
      ...this.state,
      appDrawerToggle: true
    })
    this.props.setSideNavState(true)
  }

  public render() {
    const {classes} = this.props

    const fontCss = `
    <style type="text/css">
    /* roboto-300 - latin */
    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 300;
      src: url('${config.cfBitComponentsUrl}/fonts/Roboto/roboto-latin-300.woff2') format('woff2');
      font-display: swap
    }

    /* roboto-400 - latin */
    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      src: url('${config.cfBitComponentsUrl}/fonts/Roboto/roboto-latin-400.woff2') format('woff2');
      font-display: swap
    }

    /* roboto-500 - latin */
    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 500;
      src: url('${config.cfBitComponentsUrl}/fonts/Roboto/roboto-latin-500.woff2') format('woff2');
      font-display: swap
    }
  </style>
    `

    return (
      <>
        <Helmet>
          <title>Darwin</title>
          <link
            rel='stylesheet'
            href={`${config.cfLoginUrl}/fontIcons/styles.css`}
          />
          {!this._window.microEnv && <style type='text/css'>{fontCss}</style>}
        </Helmet>
        <GlobalSpinner show={this.props.showGlobalSpinner} />
        <CssBaseline />
        {/* ========== OPEN SOURCE MODE - APP HEADER WITHOUT AUTH CHECK ==========
          * App header is now shown without checking for access token.
          * 
          * Original code checked: this.accessToken && this.accessToken.length > 0
          * To re-enable auth check, uncomment the condition below.
          */}

        {/* COMMENTED OUT: Access token check for header */}
        {/* {!this._window.microEnv &&
          this.accessToken &&
          this.accessToken.length > 0 &&
          this.props.topNavVisible && ( */}

        {/* ========== OPEN SOURCE MODE - Header shown without auth ========== */}
        {!this._window.microEnv &&
          this.props.topNavVisible && (
            <div className={classes.appHeader}>
              <AppHeader
                // handleMenuToggle={this.handleAppDrawerToggle}
                handleMenuOpen={this.handleAppDrawerOpen}
                handleMenuClose={this.handleAppDrawerClose}
                hideMenuIcon={this.isHome}
                userPermissions={this.state.permissions || []}
                isValidUrl={true}
                appDrawerToggle={this.state.appDrawerToggle}
              />
            </div>
          )}

        {/* ========== OPEN SOURCE MODE - SIDEBAR WITHOUT AUTH CHECK ==========
          * Sidebar is now shown without checking for access token.
          * 
          * Original code checked: this.accessToken && this.accessToken.length > 0
          * To re-enable auth check, uncomment the conditions below.
          */}

        {/* COMMENTED OUT: Access token check for sidebar */}
        {/* {!this._window.microEnv &&
        this.showSidebar &&
        this.accessToken &&
        this.accessToken.length > 0 &&
        this.props.sideNavVisible ? ( */}

        {/* ========== OPEN SOURCE MODE - Sidebar shown without auth ========== */}
        {!this._window.microEnv &&
        this.showSidebar &&
        this.props.sideNavVisible ? (
          <div
            className={`${classes.appDrawer} ${
              !this.state.appDrawerToggle ? classes.backdrop : ''
            }`}
          >
            <AppSideNavbar
              handleMenuOpen={this.handleAppDrawerOpen}
              handleMenuClose={this.handleAppDrawerClose}
              appDrawerToggle={this.state.appDrawerToggle}
              location={this.props.history.location}
              activeApp={this.activeApp}
              menu={this.menuList}
              userPermissions={this.permissions}
              sideNavLocalStorage={this.state.sideNavLocalStorage}
            />
          </div>
        ) : (
          ''
        )}
        <DialogContainer />
        <GlobalSnackbar />
        <div className={classes.root} data-testid='app-root-element'>
          {/* ========== OPEN SOURCE MODE - CONTENT STYLING WITHOUT AUTH CHECK ==========
            * Content styling no longer depends on access token.
            * 
            * Original code conditionally applied classes based on: this.accessToken
            * To restore original behavior, uncomment the conditions below.
            */}

          {/* COMMENTED OUT: Access token check for content styling */}
          {/* <main
            className={`${classes.content} ${
              !this._window.microEnv &&
              !this.state.appDrawerToggle &&
              this.accessToken
                ? classes.contentWithSidebar
                : ''
            } ${
              !this._window.microEnv && this.accessToken
                ? classes.contentWithAppBar
                : ''
            } ${this.accessToken ? classes.paddingContent : ''}`}
          > */}

          {/* ========== OPEN SOURCE MODE - Content styling without auth ========== */}
          <main
            className={`${classes.content} ${
              !this._window.microEnv &&
              !this.state.appDrawerToggle
                ? classes.contentWithSidebar
                : ''
            } ${
              !this._window.microEnv
                ? classes.contentWithAppBar
                : ''
            } ${classes.paddingContent}`}
          >
            <Suspense fallback={renderLoader()}>
              <SwitchRoute
                permissions={this.permissions}
                currentRoute={this.props.history.location.pathname}
              />
            </Suspense>
          </main>
        </div>
      </>
    )
  }
}

const WithRouterAppContainer = withRouter(AppContainer)

const AppShell = (props) => {
  return <WithRouterAppContainer {...props} />
}

const mapStateTopProps = (state: CommonState) => ({
  snackbar: state.snackbar,
  globalSnackBar: state.commonReducer.globalSnackBar,
  sideNavVisible: state.commonReducer.sideNavVisible,
  topNavVisible: state.commonReducer.topNavVisible,
  showGlobalSpinner: state.commonReducer.showGlobalSpinner
})

// TODO: Instead mapDispatchToProps add function directly in connect
const mapDispatchToProps = (dispatch) => ({
  saveUserPermissions(value: []) {
    dispatch(setUserPermissions(value))
  },
  setMsdUserInfoDetails(value) {
    dispatch(setMsdUserInfoDetails(value))
  },
  setActiveRoute(path) {
    dispatch(setActiveRoute(path))
  },
  handleAppContextChange(value) {
    dispatch(setAppContext(value))
    dispatch(getMenu(value))
  },
  closeSnackbar(dismiss) {
    if (dismiss) {
      dispatch(setSnackBar({open: false}))
    }
  },
  setSideNavState(value) {
    dispatch(sideNavState(value))
  }
})

const reduxedComponent = connect<{}, {}, any>(
  mapStateTopProps,
  mapDispatchToProps
)(AppShell)

const AppShellWithStyles = withStyles(styles, {withTheme: true})(
  reduxedComponent
)

const App = (props: {history?: History; location?: Location}) => (
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={MsdTheme}>
        <BitThemeWrapper theme='dark'>
          <AppShellWithStyles history={props.history} />
        </BitThemeWrapper>
      </ThemeProvider>
    </StyledEngineProvider>
  </Provider>
)

export default App
