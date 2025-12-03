import React, {useEffect, useMemo} from 'react'
import styles from './navigatorJSS'

import {WithStyles, withStyles} from '@mui/styles'
import {Route, Switch, useHistory, useLocation} from 'react-router'
import {NavLink} from 'react-router-dom'

interface NavRoute {
  name: string
  path: string
  component: JSX.Element
  subRoutes?: {
    name: string
    path: string
    component: JSX.Element
  }[]
}

interface IProps extends WithStyles<typeof styles> {
  title: string
  routes: NavRoute[]
}

const Navigator = (props: IProps) => {
  const {classes, routes, title} = props
  const history = useHistory()
  const location = useLocation()
  const tabContainerRef = React.useRef<HTMLDivElement>(null)
  const [tabContainerWidth, setTabContainerWidth] = React.useState<number>(0)

  useEffect(() => {
    if (tabContainerRef.current) {
      setTabContainerWidth(tabContainerRef.current.offsetWidth)
    }
  }, [tabContainerRef.current])

  useEffect(() => {
    if (
      location.pathname === '/settings' ||
      location.pathname === '/settings/'
    ) {
      history.push(routes[0].path)
    }
  }, [])

  return (
    <div className={classes.container}>
      <div className={classes.tabContainer} ref={tabContainerRef}>
        <h2 className={classes.title}>{title}</h2>
        {routes.map((route, index) => (
          <NavLink
            key={index}
            to={route.path}
            className={classes.navLink}
            activeClassName={classes.activeNavLink}
          >
            {route.name}
          </NavLink>
        ))}
        <Switch>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} exact={true} />
          ))}
        </Switch>
      </div>
      <div
        className={classes.contentContainer}
        style={{
          width: `calc(100% - ${tabContainerWidth}px)`,
          marginLeft: `${tabContainerWidth}px`
        }}
      >
        <Switch>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} exact={true}>
              {route.component}
            </Route>
          ))}
        </Switch>
        <Switch>
          {routes.map((route, index) => {
            if (route.subRoutes) {
              return route.subRoutes.map((subRoute, subIndex) => (
                <Route key={subIndex} path={subRoute.path} exact={true}>
                  {subRoute.component}
                </Route>
              ))
            }
          })}
        </Switch>
      </div>
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(Navigator)
export default StyledComponent
