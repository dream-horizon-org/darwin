import {config} from 'node-config-ts'
import app from './src/server/middlewares/app'
import './tracer'
const application = app()
application.listen(config.port, function () {
  return 'server started on port ' + config.port
})
