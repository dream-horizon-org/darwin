// IMPORTANT: Import instrumentation FIRST before any GraphQL modules
import './instrumentation'

import {config} from './src/lib/config'
import {HARDCODED_USER} from './src/lib/http-client'
import {logger} from './logger/winstonLogger'
import cors = require('cors')
import express = require('express')
import {ModuleGraphQl} from './bootloader'

const app = express()

// Enable CORS
app.use(cors({credentials: true, origin: true}))

// Health check endpoint
app.get('/health', (request: any, response: any) =>
  response.json({status: 'Success', service: 'ml-platform-graphql'})
)

// Middleware to inject hardcoded user into all requests
// Phase 1: No authentication, using hardcoded user with all permissions
app.use('/', (req: any, res, next) => {
  req.msd_user = HARDCODED_USER
  req.permissionDetails = {
    // Hardcoded user has all permissions
    admin: true,
    'ml-platform-access': true,
  }
  next()
})

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err)
  if (err?.response?.status === 403) {
    res.sendStatus(403)
  } else {
    next(err)
  }
})

// Initialize Apollo Server
const server = ModuleGraphQl
server.start().then(() => {
  server.applyMiddleware({
    app,
    cors: {credentials: true, origin: true},
    path: '/graphql',
  })

  logger.info(
    `🚀 ML Platform GraphQL Server ready at http://localhost:${config.port}${server.graphqlPath}`
  )
  if (config.ENABLE_PLAYGROUND) {
    logger.info(
      `🎮 GraphQL Playground available at http://localhost:${config.port}${server.graphqlPath}`
    )
  }
})

app.listen(config.port, () => {
  logger.info(
    `Server listening on port ${config.port} in ${config.nodeEnv} mode`
  )
  logger.info(
    `Using hardcoded user: ${HARDCODED_USER.name} (${HARDCODED_USER.email})`
  )
})
