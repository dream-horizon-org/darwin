import config from 'config'
import Tokens from 'csrf'
import express from 'express'
import {menu} from '../../utils/menuConstants'

const appendCorsHeaders = (req: any, res: any) => {
  const reqOrigin = req.headers.origin
  if (
    reqOrigin &&
    config.allowedCorsDomains.find((domain) => reqOrigin.indexOf(domain) !== -1)
  ) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin)
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With, content-type, Authorization'
    )
  }
}

const application = () => {
  const app = express()
  const router = express.Router()

  router.get('/', (req, res) => {
    res.json({status: 'UP'})
  })
  app.get('/menu-constants', (req, res, next) => {
    appendCorsHeaders(req, res)
    res.send(JSON.stringify(menu))
  })
  app.use('/health', router)
  app.use('/mlplatform/health', router)
  let setCache = function (req, res, next) {
    const period = 604800
    if (req.path.endsWith('.json')) {
      next()
      return
    }
    // res.setHeader('Cache-Control', `public, max-age=${period}`)
    // remember to call next() to pass on the request
    next()
  }

  // now call the new middleware function in your app new

  app.use(setCache)
  app.use('/s3/', express.static(`${__dirname}/../../../s3/`))
  app.use('/bitBucket/', express.static(`${__dirname}/../../../bitBucket/`))
  app.use('/assets/', express.static(`${__dirname}/../../../assets/`))
  app.use(
    `/mlplatform/`,
    (req, res, next) => {
      if (
        !(
          process.env.NODE_ENV === 'dev-local' ||
          process.env.NODE_ENV === 'test' ||
          req.url.indexOf('.json') !== -1 ||
          req.url.indexOf('.wasm') !== -1
        )
      ) {
        res.setHeader('content-encoding', 'br')
      }
      appendCorsHeaders(req, res)

      next()
    },
    express.static(`${__dirname}/../../../public/`)
  )
  app.use('/status/', express.static(`${__dirname}/../../../status/`))
  app.use('/storybook/', express.static(`${__dirname}/../../../storybook/`))

  app.use(
    `/*`,
    function (req, res, next) {
      const tokens = new Tokens()
      res.cookie('cms_csrf', tokens.create(config.csrfSecret))
      if (
        !(
          process.env.NODE_ENV === 'dev-local' ||
          process.env.NODE_ENV === 'test' ||
          req.url.indexOf('.json') !== -1 ||
          req.url.indexOf('.wasm') !== -1
        )
      ) {
        res.setHeader('content-encoding', 'br')
      }
      appendCorsHeaders(req, res)
      next()
    },
    express.static(`${__dirname}/../../../public/`)
  )

  app.use(
    `/login`,
    function (req, res, next) {
      const tokens = new Tokens()
      res.cookie('cms_csrf', tokens.create(config.csrfSecret))
      if (
        !(
          process.env.NODE_ENV === 'dev-local' ||
          process.env.NODE_ENV === 'test' ||
          req.url.indexOf('.json') !== -1
        )
      ) {
        res.setHeader('content-encoding', 'br')
      }
      appendCorsHeaders(req, res)
      next()
    },
    express.static(`${__dirname}/../../../public/`)
  )

  app.use(
    `/mlp-google-login-callback`,
    function (req, res, next) {
      const tokens = new Tokens()
      res.cookie('cms_csrf', tokens.create(config.csrfSecret))
      if (
        !(
          process.env.NODE_ENV === 'dev-local' ||
          process.env.NODE_ENV === 'test' ||
          req.url.indexOf('.json') !== -1
        )
      ) {
        res.setHeader('content-encoding', 'br')
      }
      appendCorsHeaders(req, res)
      next()
    },
    express.static(`${__dirname}/../../../public/`)
  )

  return app
}
export default application
